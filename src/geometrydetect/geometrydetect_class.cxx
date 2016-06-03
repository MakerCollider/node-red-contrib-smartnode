#include <iostream>
#include <sstream>

#include <Windows.h>

#include "geometrydetect_class.h"

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

    Persistent<Function> GeometryDetect::constructor;

    GeometryDetect::GeometryDetect()
    {

    }

    GeometryDetect::~GeometryDetect()
    {

    }

    void GeometryDetect::Init(v8::Local<v8::Object> exports)
    {
        Isolate* isolate = exports->GetIsolate();

        Local<FunctionTemplate> tpl = FunctionTemplate::New(isolate, New);
        tpl->SetClassName(String::NewFromUtf8(isolate, "GeometryDetect"));
        tpl->InstanceTemplate()->SetInternalFieldCount(1);

        NODE_SET_PROTOTYPE_METHOD(tpl, "detect", detect);

        constructor.Reset(isolate, tpl->GetFunction());
        exports->Set(String::NewFromUtf8(isolate, "GeometryDetect"),
            tpl->GetFunction());
    }

    void GeometryDetect::New(const FunctionCallbackInfo<Value>& args)
    {
        Isolate* isolate = args.GetIsolate();

        if (args.IsConstructCall())
        {
            GeometryDetect* obj = new GeometryDetect();
            obj->Wrap(args.This());
            args.GetReturnValue().Set(args.This());
        }
        else
        {
            Local<Function> cons = Local<Function>::New(isolate, constructor);
            args.GetReturnValue().Set(cons->NewInstance(0, NULL));
        }
    }

    void GeometryDetect::ptr2String(void* in_ptr, std::string &in_str)
    {
        static unsigned long long ptr2Number;
        std::stringstream number2Stream;

        ptr2Number = (unsigned long long)in_ptr;
        number2Stream << ptr2Number;
        //in_str = "Camera:" + number2Stream.str();
        in_str = number2Stream.str();
    }

    bool GeometryDetect::string2Ptr(std::string &in_str, void** in_ptr)
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

    size_t GeometryDetect::getGeometry()
    {
        cv::Mat img_gray, img_thres, img_canny, img_contours;

        std::vector<cv::Point> poly;
        std::vector<cv::Vec3f> circles;
        std::vector<std::vector<cv::Point> > contours;

        unsigned int i;
        double area;

        GeometryResultType result = GEOMETRY_NOTHING;
        cv::Mat outputImage;
        outputImage = cv::Mat::zeros(m_rawImage.rows, m_rawImage.cols, CV_8UC1);

        cv::cvtColor((m_rawImage), img_gray, cv::COLOR_RGB2GRAY);
        cv::adaptiveThreshold(img_gray, img_thres, 255, cv::ADAPTIVE_THRESH_GAUSSIAN_C,
                            cv::THRESH_BINARY,201,20);
        cv::Canny(img_thres, img_canny, 150, 200);
        cv::findContours(img_canny, contours, cv::RETR_TREE, cv::CHAIN_APPROX_SIMPLE);

        for (i = 0; i < contours.size(); i++)
        {
            area = fabs(cv::contourArea(contours[i]));
            if (area > 1500)
            {
                cv::drawContours(outputImage, contours, i, cv::Scalar(255), cv::FILLED);
                cv::approxPolyDP(contours[i], poly, 5, 1);
                if (poly.size() == 4)
                {
                    result = GEOMETRY_RECTANGLE;
                    break;
                }
                else
                {
                    cv::HoughCircles(outputImage, circles, cv::HOUGH_GRADIENT,
                                        2, outputImage.rows / 2, 30, 15);
                    if (circles.size() != 0)
                    {
                        result = GEOMETRY_CIRCLE;
                        break;
                    }
                }
            }
        }

        cv::cvtColor(outputImage, m_finalImage, cv::COLOR_GRAY2BGR);
        return result;
    }

    void GeometryDetect::detect(const v8::FunctionCallbackInfo<v8::Value>& args)
    {
        Isolate* isolate = args.GetIsolate();
        GeometryDetect* obj = ObjectWrap::Unwrap<GeometryDetect>(args.Holder());
        Local<Function> cons = Local<Function>::New(isolate, constructor);

        if (!args[0]->IsUndefined())
        {
            size_t result = 0;
            std::string ptrString = "";

            String::Utf8Value utf8Value(args[0]->ToString());
            std::string in_ptr = std::string(*utf8Value);

            cv::Mat* in_rawImage;
            if (obj->string2Ptr(in_ptr, (void**)&in_rawImage))
            {
                in_rawImage->copyTo(obj->m_rawImage);
                in_rawImage->copyTo(obj->m_finalImage);
                result = obj->getGeometry();
                obj->ptr2String((void*)&obj->m_finalImage, ptrString);
            }
            else
                result = 0;

            std::string resultString;
            switch (result)
            {
                case 1:
                    resultString = "NOTHING";
                    break;
                case 2:
                    resultString = "RECTANGLE";
                    break;
                case 3:
                    resultString = "CIRCLE";
                    break;
                default:
                    resultString = "ERROR";
            }

            //Local<Number> rslt = Number::New(isolate, result);
            Local<String> otstr = String::NewFromUtf8(isolate, ptrString.c_str());
            Local<String> rslt = String::NewFromUtf8(isolate, resultString.c_str());

            Local<Object> returnObject = Object::New(isolate);
            returnObject->Set (String::NewFromUtf8(isolate, "result"), rslt);
            returnObject->Set (String::NewFromUtf8(isolate, "imageStr"), otstr);
            args.GetReturnValue().Set(returnObject);
        }
        else
        {
            std::cout << "GeometryDetect::detect ---> input args error" << std::endl;
            args.GetReturnValue().Set(cons->NewInstance(0, NULL));
        }
    }
}