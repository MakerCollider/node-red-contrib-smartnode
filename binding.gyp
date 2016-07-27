{
    "targets": [
        {
            "target_name": "sn_addon",
            "sources": [
                "./src/sn_addon.cc",
                "./src/camera/camera_class.cxx",
                "./src/facedetect/facedetect_class.cxx",
                "./src/geometrydetect/geometrydetect_class.cxx",
                "./src/image2base64/image2base64_class.cxx"
            ],
            'link_settings': {
                'libraries': [
                    "-lopencv_core310",
                    "-lopencv_highgui310",
                    "-lopencv_videoio310",
                    "-lopencv_imgcodecs310",
                    "-lopencv_objdetect310",
                    "-lopencv_imgproc310"
                ]
            },
            'conditions': [
                ['OS=="win"', {
                    'include_dirs': [
                        '$(OPENCV_DIR)/include',
                    ],
                    'link_settings': {
                        'library_dirs': ["$(OPENCV_DIR)/<(target_arch)/vc12/lib"]
                    },
                    'defines!' : [ '_HAS_EXCEPTIONS=0' ],
                    'msvs_settings': {
                        'VCCLCompilerTool': {
                            'AdditionalOptions': [ '/EHsc' ]
                        }
                    }
                }]
            ]
        },
        {
            "target_name": "copy_files",
            "type":"none",
            "dependencies" : [ "sn_addon" ],
            "copies": [
                {
                    "conditions": [
                        ["OS=='win'", {
                            "files": [
                                "<(PRODUCT_DIR)/<(module_name).node",
                                "$(OPENCV_DIR)/<(target_arch)/vc12/bin/opencv_core310.dll",
                                "$(OPENCV_DIR)/<(target_arch)/vc12/bin/opencv_highgui310.dll",
                                "$(OPENCV_DIR)/<(target_arch)/vc12/bin/opencv_videoio310.dll",
                                "$(OPENCV_DIR)/<(target_arch)/vc12/bin/opencv_imgproc310.dll",
                                "$(OPENCV_DIR)/<(target_arch)/vc12/bin/opencv_imgcodecs310.dll",
                                "$(OPENCV_DIR)/<(target_arch)/vc12/bin/opencv_objdetect310.dll",
                                "$(OPENCV_DIR)/<(target_arch)/vc12/bin/opencv_ml310.dll"
                            ]
                        }],
                        ["OS=='linux'", {
                            "files": [
                                "<(PRODUCT_DIR)/<(module_name).node",
                                "/usr/local/lib/libopencv_core.so.*",
                                "/usr/local/lib/libopencv_highgui.so.*",
                                "/usr/local/lib/libopencv_videoio.so.*",
                                "/usr/local/lib/libopencv_imgproc.so.*",
                                "/usr/local/lib/libopencv_imgcodecs.so.*",
                                "/usr/local/lib/libopencv_objdetect.so.*",
                                "/usr/local/lib/libopencv_ml.so.*",
                            ]
                        }]
                    ],
                    "destination": "<(module_path)"
                }
            ]
        },
        {
            "target_name": "copy_haarcascade_files",
            "type":"none",
            "dependencies" : [ "sn_addon" ],
            "copies": [
                {
                    "conditions": [
                        ["OS=='win'", {
                            "files": [
                                "$(OPENCV_DIR)/etc/haarcascades/haarcascade_frontalface_alt.xml",
                            ]
                        }],
                        ["OS=='linux'", {
                            "files": [
                                "/usr/local/share/OpenCV/haarcascades/haarcascade_frontalface_alt.xml",
                            ]
                        }]
                    ],
                    "destination": "<(module_path)/haarcascade"
                }
            ]
        }
    ]
}