#pragma once

#include <mutex>
#include <thread>

#include <node.h>
#include <node_object_wrap.h>

#include "opencv2/opencv.hpp"

namespace mc
{
    class Image2base64 : public node::ObjectWrap
    {
    private:
        static const std::string s_base64Chars;

    private:
        void ptr2String(void* in_ptr, std::string &in_str);
        bool string2Ptr(std::string &in_str, void** in_ptr);

        std::string base64_encode(unsigned char const* bytes_to_encode,
                                    size_t in_len);

        std::string base64();

    public:
        cv::Mat m_rawImage;

    public:
        static void Init(v8::Local<v8::Object> exports);
        static void New(const v8::FunctionCallbackInfo<v8::Value>& args);
        static v8::Persistent<v8::Function> constructor;

        explicit  Image2base64();
        ~Image2base64();

        static void encode(const v8::FunctionCallbackInfo<v8::Value>& args);
    };
}