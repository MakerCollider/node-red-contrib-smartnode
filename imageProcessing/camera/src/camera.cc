// addon.cc
#include <node.h>

#include "camera_class.h"

namespace mc {

using v8::Local;
using v8::Object;

void InitAll(Local<Object> exports) {
  Camera::Init(exports);
}

NODE_MODULE(camera, InitAll)

}