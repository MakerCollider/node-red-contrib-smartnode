#include <node.h>

#include "camera/camera_class.h"
#include "facedetect/facedetect_class.h"
#include "geometrydetect/geometrydetect_class.h"
#include "image2base64/image2base64_class.h"

namespace mc {

using v8::Local;
using v8::Object;

void InitAll(Local<Object> exports) {
  Camera::Init(exports);
  FaceDetect::Init(exports);
  GeometryDetect::Init(exports);
  Image2base64::Init(exports);
}

NODE_MODULE(sn_addon, InitAll)

}