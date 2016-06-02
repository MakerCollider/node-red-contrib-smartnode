#pragma once

#include <mutex>
#include <thread>

#include <node.h>
#include <node_object_wrap.h>

#include "opencv2/opencv.hpp"

namespace mc
{
    class FaceDetect : public node::ObjectWrap
    {
    private:
        cv::CascadeClassifier face_cascade;

    private:
        void ptr2String(void* in_ptr, std::string &in_str);
        bool string2Ptr(std::string &in_str, void** in_ptr);

        size_t getFace();

    public:
        cv::Mat m_rawImage, m_finalImage;

    public:
        static void Init(v8::Local<v8::Object> exports);
        static void New(const v8::FunctionCallbackInfo<v8::Value>& args);
        static v8::Persistent<v8::Function> constructor;

        explicit  FaceDetect();
        ~FaceDetect();

        static void initFaceDetect(const v8::FunctionCallbackInfo<v8::Value>& args);
        static void detect(const v8::FunctionCallbackInfo<v8::Value>& args);
    };
}