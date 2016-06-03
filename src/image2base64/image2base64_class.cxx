#include <iostream>
#include <sstream>

#include <Windows.h>

#include "image2base64_class.h"

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

    Persistent<Function> Image2base64::constructor;

    const std::string Image2base64::s_base64Chars =
                                "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
                                "abcdefghijklmnopqrstuvwxyz"
                                "0123456789+/";

    Image2base64::Image2base64()
    {

    }

    Image2base64::~Image2base64()
    {

    }

    void Image2base64::Init(v8::Local<v8::Object> exports)
    {
        Isolate* isolate = exports->GetIsolate();

        Local<FunctionTemplate> tpl = FunctionTemplate::New(isolate, New);
        tpl->SetClassName(String::NewFromUtf8(isolate, "Image2base64"));
        tpl->InstanceTemplate()->SetInternalFieldCount(1);

        NODE_SET_PROTOTYPE_METHOD(tpl, "encode", encode);

        constructor.Reset(isolate, tpl->GetFunction());
        exports->Set(String::NewFromUtf8(isolate, "Image2base64"),
            tpl->GetFunction());
    }

    void Image2base64::New(const FunctionCallbackInfo<Value>& args)
    {
        Isolate* isolate = args.GetIsolate();

        if (args.IsConstructCall())
        {
            Image2base64* obj = new Image2base64();
            obj->Wrap(args.This());
            args.GetReturnValue().Set(args.This());
        }
        else
        {
            Local<Function> cons = Local<Function>::New(isolate, constructor);
            args.GetReturnValue().Set(cons->NewInstance(0, NULL));
        }
    }

    void Image2base64::ptr2String(void* in_ptr, std::string &in_str)
    {
        static unsigned long long ptr2Number;
        std::stringstream number2Stream;

        ptr2Number = (unsigned long long)in_ptr;
        number2Stream << ptr2Number;
        //in_str = "Camera:" + number2Stream.str();
        in_str = number2Stream.str();
    }

    bool Image2base64::string2Ptr(std::string &in_str, void** in_ptr)
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

    std::string Image2base64::base64_encode(unsigned char const* bytes_to_encode, size_t in_len)
    {
        std::string ret;
        int i = 0;
        int j = 0;
        unsigned char char_array_3[3];
        unsigned char char_array_4[4];

        while (in_len--)
        {
            char_array_3[i++] = *(bytes_to_encode++);
            if (i == 3)
            {
                char_array_4[0] = (char_array_3[0] & 0xfc) >> 2;
                char_array_4[1] = ((char_array_3[0] & 0x03) << 4) + ((char_array_3[1] & 0xf0) >> 4);
                char_array_4[2] = ((char_array_3[1] & 0x0f) << 2) + ((char_array_3[2] & 0xc0) >> 6);
                char_array_4[3] = char_array_3[2] & 0x3f;

                for(i = 0; (i <4) ; i++)
                {
                    ret += s_base64Chars[char_array_4[i]];
                }
                i = 0;
            }
        }

        if (i)
        {
            for(j = i; j < 3; j++)
                char_array_3[j] = '\0';

            char_array_4[0] = (char_array_3[0] & 0xfc) >> 2;
            char_array_4[1] = ((char_array_3[0] & 0x03) << 4) + ((char_array_3[1] & 0xf0) >> 4);
            char_array_4[2] = ((char_array_3[1] & 0x0f) << 2) + ((char_array_3[2] & 0xc0) >> 6);
            char_array_4[3] = char_array_3[2] & 0x3f;

            for (j = 0; (j < i + 1); j++)
            {
                ret += s_base64Chars[char_array_4[j]];
            }

            while((i++ < 3))
            {
                ret += '=';
            }
        }

        return ret;
    }

    std::string Image2base64::base64()
    {
        std::vector<uchar> imageVector;
        cv::imencode(".png", m_rawImage, imageVector);
        size_t imageVecLength = imageVector.size();
        uchar *imageBuffer = new uchar[imageVecLength];
        for(uint32_t i=0; i<imageVecLength; i++)
        {
            imageBuffer[i] = imageVector[i];
        }

        std::string imageString = base64_encode(imageBuffer, imageVecLength);
        std::string headString = "data:image/png;base64,";
        std::string finalString = headString + imageString;
        delete imageBuffer;

        return finalString;
    }

    void Image2base64::encode(const v8::FunctionCallbackInfo<v8::Value>& args)
    {
        Isolate* isolate = args.GetIsolate();
        Image2base64* obj = ObjectWrap::Unwrap<Image2base64>(args.Holder());
        Local<Function> cons = Local<Function>::New(isolate, constructor);

        if (!args[0]->IsUndefined())
        {
            std::string result = "";
            std::string ptrString = "";

            String::Utf8Value utf8Value(args[0]->ToString());
            std::string in_ptr = std::string(*utf8Value);

            cv::Mat* in_rawImage;
            if (obj->string2Ptr(in_ptr, (void**)&in_rawImage))
            {
                in_rawImage->copyTo(obj->m_rawImage);
                result = obj->base64();
            }
            else
                result = "ERROR";

            args.GetReturnValue().Set(v8::String::NewFromUtf8(isolate, result.c_str()));
        }
        else
        {
            std::cout << "Image2base64::encode ---> input args error" << std::endl;
            args.GetReturnValue().Set(cons->NewInstance(0, NULL));
        }
    }
}