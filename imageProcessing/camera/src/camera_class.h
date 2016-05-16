#pragma once

#include <mutex>
#include <thread>

#include <node.h>
#include <node_object_wrap.h>

#include "opencv2/opencv.hpp"

namespace mc
{
    class Camera : public node::ObjectWrap
    {
    private:
        cv::VideoCapture m_camera;
        cv::Mat m_rawImage;
        unsigned char m_cameraId;
        double m_width;
        double m_height;

        bool m_running;
        std::thread *m_grabThread;
        std::mutex m_mutex;

    private:
        static void ptr2String(void* in_ptr, std::string &in_str);
        static bool string2Ptr(std::string &in_str, void** in_ptr);

        bool checkCamera(int in_videoID);
        static void* grabFunc(void* in_data);
        void stopCamera();

    public:
        static void Init(v8::Local<v8::Object> exports);
        static void New(const v8::FunctionCallbackInfo<v8::Value>& args);
        static v8::Persistent<v8::Function> constructor;

        explicit  Camera(unsigned char in_cameraId, double in_width=0, double in_height=0);
        ~Camera();

        static void startCamera(const v8::FunctionCallbackInfo<v8::Value>& args);
        static void stopCamera(const v8::FunctionCallbackInfo<v8::Value>& args);
        static void isOpened(const v8::FunctionCallbackInfo<v8::Value>& args);
        static void read(const v8::FunctionCallbackInfo<v8::Value>& args);
        static void shoot(const v8::FunctionCallbackInfo<v8::Value>& args);
    };
}