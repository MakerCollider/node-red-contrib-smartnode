#include <iostream>
#include <sstream>

#include <Windows.h>

#include "facedetect_class.h"

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
    using v8::Context;

    Persistent<Function> FaceDetect::constructor;

    FaceDetect::FaceDetect()
    {

    }

    FaceDetect::~FaceDetect()
    {

    }

    void FaceDetect::Init(v8::Local<v8::Object> exports)
    {
        Isolate* isolate = exports->GetIsolate();

        Local<FunctionTemplate> tpl = FunctionTemplate::New(isolate, New);
        tpl->SetClassName(String::NewFromUtf8(isolate, "FaceDetect"));
        tpl->InstanceTemplate()->SetInternalFieldCount(1);

        NODE_SET_PROTOTYPE_METHOD(tpl, "detect", detect);
        NODE_SET_PROTOTYPE_METHOD(tpl, "initFaceDetect", initFaceDetect);

        constructor.Reset(isolate, tpl->GetFunction());
        exports->Set(String::NewFromUtf8(isolate, "FaceDetect"),
            tpl->GetFunction());
    }

    void FaceDetect::New(const FunctionCallbackInfo<Value>& args)
    {
        Isolate* isolate = args.GetIsolate();

        if (args.IsConstructCall())
        {
            FaceDetect* obj = new FaceDetect();
            obj->Wrap(args.This());
            args.GetReturnValue().Set(args.This());
        }
        else
        {
            Local<Function> cons = Local<Function>::New(isolate, constructor);
            args.GetReturnValue().Set(cons->NewInstance(0, NULL));
        }
    }

    void FaceDetect::ptr2String(void* in_ptr, std::string &in_str)
    {
        static unsigned long long ptr2Number;
        std::stringstream number2Stream;

        ptr2Number = (unsigned long long)in_ptr;
        number2Stream << ptr2Number;
        //in_str = "Camera:" + number2Stream.str();
        in_str = number2Stream.str();
    }

    bool FaceDetect::string2Ptr(std::string &in_str, void** in_ptr)
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

    void FaceDetect::initFaceDetect(const v8::FunctionCallbackInfo<v8::Value>& args)
    {
        Isolate* isolate = args.GetIsolate();
        FaceDetect* obj = ObjectWrap::Unwrap<FaceDetect>(args.Holder());

        String::Utf8Value utf8Value(args[0]->ToString());
        std::string filePath = std::string(*utf8Value);

        bool result = false;
        if(!obj->face_cascade.load(filePath))
        {
            std::cout << "can not find face_cascade_file!" << std::endl;
            result = false;
        }
        else
            result = true;

        args.GetReturnValue().Set(v8::Boolean::New(isolate, result));
    }

    size_t FaceDetect::getFace()
    {
        cv::Mat smallImage, grayImage;

        cv::resize(m_rawImage, smallImage, cv::Size(128, 96));
        cv::cvtColor(smallImage, grayImage, cv::COLOR_BGR2GRAY);
        equalizeHist(grayImage, grayImage);

        std::vector<cv::Rect> faces;
        face_cascade.detectMultiScale(grayImage, faces, 1.1,
            2, 0 | cv::CASCADE_SCALE_IMAGE, cv::Size(30, 30));

        if (faces.empty())
        {
            return 0;
        }
        else
        {
            double wScale = double(m_finalImage.cols) / grayImage.cols;
            double hScale = double(m_finalImage.rows) / grayImage.rows;

            for (unsigned int i = 0; i < faces.size(); i++)
            {
                cv::Point2d center((faces[i].x + faces[i].width*0.5)*wScale, (faces[i].y + faces[i].height*0.5)*hScale);
                cv::ellipse(m_finalImage, center, cv::Size2d(faces[i].width*0.5*wScale, faces[i].height*0.5*hScale),
                    0, 0, 360, cv::Scalar(255, 0, 255), 2, cv::LINE_AA, 0);
            }

            return faces.size();
        }
    }

    void FaceDetect::detect(const v8::FunctionCallbackInfo<v8::Value>& args)
    {
        Isolate* isolate = args.GetIsolate();
        FaceDetect* obj = ObjectWrap::Unwrap<FaceDetect>(args.Holder());
        Local<Function> cons = Local<Function>::New(isolate, constructor);

        if (!args[0]->IsUndefined())
        {
            double result = -1;
            std::string ptrString = "";

            String::Utf8Value utf8Value(args[0]->ToString());
            std::string in_ptr = std::string(*utf8Value);

            cv::Mat* in_rawImage;
            if (obj->string2Ptr(in_ptr, (void**)&in_rawImage))
            {
                in_rawImage->copyTo(obj->m_rawImage);
                in_rawImage->copyTo(obj->m_finalImage);
                result = static_cast<double>(obj->getFace());
                // cv::imshow("res", obj->m_finalImage);
                // cv::waitKey(1);
                obj->ptr2String((void*)&obj->m_finalImage, ptrString);
            }
            else
                result = -1;

            Local<Number> rslt = Number::New(isolate, result);
            Local<String> otstr = String::NewFromUtf8(isolate, ptrString.c_str());

            Local<Object> returnObject = Object::New(isolate);
            returnObject->Set (String::NewFromUtf8(isolate, "imageStr"), otstr);
            returnObject->Set (String::NewFromUtf8(isolate, "result"), rslt);
            args.GetReturnValue().Set(returnObject);
        }
        else
        {
            args.GetReturnValue().Set(cons->NewInstance(0, NULL));
        }
    }
}