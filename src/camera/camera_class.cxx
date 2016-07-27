#include <iostream>
#include <sstream>
#ifdef _WIN32
    #include <Windows.h>
#else
    #include <unistd.h>
#endif

#include "camera_class.h"

namespace mc
{
    using v8::Function;
    using v8::FunctionCallbackInfo;
    using v8::FunctionTemplate;
    using v8::Isolate;
    using v8::Local;
    using v8::Number;
    using v8::Object;
    using v8::Persistent;
    using v8::String;
    using v8::Value;

    Persistent<Function> Camera::constructor;

    cv::Mat Camera::m_rawImage = cv::Mat::zeros(3, 3, CV_32F);

    Camera::Camera(unsigned char in_cameraId, double in_width, double in_height)
    {
        m_running = false;
        m_cameraId = in_cameraId;
        m_width = in_width;
        m_height = in_height;
    }

    Camera::~Camera()
    {
        stopCamera();
    }

    void Camera::Init(v8::Local<v8::Object> exports)
    {
        Isolate* isolate = exports->GetIsolate();

        Local<FunctionTemplate> tpl = FunctionTemplate::New(isolate, New);
        tpl->SetClassName(String::NewFromUtf8(isolate, "Camera"));
        tpl->InstanceTemplate()->SetInternalFieldCount(1);

        NODE_SET_PROTOTYPE_METHOD(tpl, "startCamera", startCamera);
        NODE_SET_PROTOTYPE_METHOD(tpl, "stopCamera", stopCamera);
        NODE_SET_PROTOTYPE_METHOD(tpl, "isOpened", isOpened);
        NODE_SET_PROTOTYPE_METHOD(tpl, "read", read);
        NODE_SET_PROTOTYPE_METHOD(tpl, "shoot", shoot);

        constructor.Reset(isolate, tpl->GetFunction());
        exports->Set(String::NewFromUtf8(isolate, "Camera"),
                   tpl->GetFunction());
    }

    void Camera::New(const FunctionCallbackInfo<Value>& args)
    {
        Isolate* isolate = args.GetIsolate();

        if (args.IsConstructCall())
        {
            unsigned char value1 = static_cast<unsigned char>(args[0]->IsUndefined() ? 0 : args[0]->NumberValue());
            double value2 = args[1]->IsUndefined() ? 0 : args[1]->NumberValue();
            double value3 = args[2]->IsUndefined() ? 0 : args[2]->NumberValue();
            Camera* obj = new Camera(value1, value2, value3);
            obj->Wrap(args.This());
            args.GetReturnValue().Set(args.This());
        } 
        else
        {
            const int argc = 3;
            Local<Value> argv[argc] = { args[0], args[1], args[2] };
            Local<Function> cons = Local<Function>::New(isolate, constructor);
            args.GetReturnValue().Set(cons->NewInstance(argc, argv));
        }
    }

    void Camera::ptr2String(void* in_ptr, std::string &in_str)
    {
        static unsigned long long ptr2Number;
        std::stringstream number2Stream;

        ptr2Number = (unsigned long long)in_ptr;
        number2Stream << ptr2Number;
        //in_str = "Camera:" + number2Stream.str();
        in_str = number2Stream.str();
    }

    bool Camera::string2Ptr(std::string &in_str, void** in_ptr)
    {
        //static std::string head;
        //static std::string strCut;
        static std::istringstream strStream;
        static unsigned long long number;

        // head.assign(in_str, 0, 7);
        // if(head != "Camera:")
        //     return false;

        // strCut.assign(in_str, 7, in_str.length());
        strStream.str(in_str);
        strStream >> number;
        *in_ptr = (void*)(number);
        return true;
    }

    void Camera::startCamera(const FunctionCallbackInfo<Value>& args)
    {
        Isolate* isolate = args.GetIsolate();

        Camera* obj = ObjectWrap::Unwrap<Camera>(args.Holder());

        bool isOpened = true;

        if(obj->m_running != true)
        {
            obj->m_camera.open(obj->m_cameraId);
            #ifdef _WIN32
                Sleep(1);
            #elif
                sleep(1);
            #endif
            if(obj->m_camera.isOpened())
            {
                obj->m_running = true;
                obj->m_camera.set(cv::CAP_PROP_FRAME_WIDTH, obj->m_width);
                obj->m_camera.set(cv::CAP_PROP_FRAME_HEIGHT, obj->m_height);
                obj->m_grabThread = new std::thread(grabFunc, obj);
            }
            else
                isOpened = false;
        }

        args.GetReturnValue().Set(v8::Boolean::New(isolate, isOpened));
    }

    void Camera::stopCamera()
    {
        if(m_running)
        {
            m_running = false;
            m_grabThread->join();
            m_camera.release();
            #ifdef _WIN32
                Sleep(1);
            #elif
                sleep(1);
            #endif
        }
    }

    void Camera::stopCamera(const v8::FunctionCallbackInfo<v8::Value>& args)
    {
        Isolate* isolate = args.GetIsolate();
        Camera* obj = ObjectWrap::Unwrap<Camera>(args.Holder());

        obj->stopCamera();
    }

    void Camera::isOpened(const v8::FunctionCallbackInfo<v8::Value>& args)
    {
        Isolate* isolate = args.GetIsolate();
        Camera* obj = ObjectWrap::Unwrap<Camera>(args.Holder());

        args.GetReturnValue().Set(v8::Boolean::New(isolate, obj->m_running));
    }

    // bool Camera::checkCamera(int in_videoID)
    // {
    //     return true;
    // }

    void* Camera::grabFunc(void* in_data)
    {
        bool result;
        Camera* in_class = (Camera*)(in_data);

        while(in_class->m_running)
        {
            in_class->m_mutex.lock();

            result = in_class->m_camera.grab();
            if (!result)
            {
                in_class->m_running = false;
                in_class->m_camera.release();
            }
            
            in_class->m_mutex.unlock();

            std::this_thread::yield();
        }
        return 0;
    }

    void Camera::read(const v8::FunctionCallbackInfo<v8::Value>& args)
    {
        Isolate* isolate = args.GetIsolate();
        Camera* obj = ObjectWrap::Unwrap<Camera>(args.Holder());

        std::string ptrString = "";

        obj->m_mutex.lock();
        if(obj->m_running)
        {
            obj->m_camera.retrieve(m_rawImage);
            obj->ptr2String((void*)(&m_rawImage), ptrString);
        }
        obj->m_mutex.unlock();
        
        args.GetReturnValue().Set(v8::String::NewFromUtf8(isolate, ptrString.c_str()));
    }

    void Camera::shoot(const v8::FunctionCallbackInfo<v8::Value>& args)
    {
        Isolate* isolate = args.GetIsolate();
        Camera* obj = ObjectWrap::Unwrap<Camera>(args.Holder());

        std::string ptrString = "";

        if(!args[0]->IsUndefined())
        {
            obj->m_mutex.lock();
            if(obj->m_running)
            {
                String::Utf8Value utf8Value(args[0]->ToString());
                std::string in_filePath = std::string(*utf8Value);
                // std::cout << in_filePath << std::endl;
                obj->m_camera.read(m_rawImage);
                cv::imwrite(in_filePath, m_rawImage);
                obj->ptr2String((void*)&(m_rawImage), ptrString);
            }
            obj->m_mutex.unlock();
        }
        else
        {
            ptrString = "path error";
        }

        args.GetReturnValue().Set(v8::String::NewFromUtf8(isolate, ptrString.c_str()));
    }
}
