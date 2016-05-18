{
    "targets": [
        {
            "target_name": "sn_addon",
            "sources": [
                "./src/camera/camera.cc",
                "./src/camera/camera_class.cxx"
            ],
            'include_dirs': [
                '$(OPENCV_DIR)/include',
            ],
            'link_settings': {
                'library_dirs': ["$(OPENCV_DIR)/<(target_arch)/vc12/lib"],
                'libraries': [
                    "-lopencv_core310", 
                    "-lopencv_videoio310", 
                    "-lopencv_imgcodecs310"
                ]
            },
            'defines!' : [ '_HAS_EXCEPTIONS=0' ],
            'msvs_settings': {
                'VCCLCompilerTool': {
                    'AdditionalOptions': [ '/EHsc' ]
                }
            }
        },
        {
            "target_name": "copy_files",
            "type":"none",
            "dependencies" : [ "sn_addon" ],
            "copies": [
                {
                    "files": [
                        "<(PRODUCT_DIR)/<(module_name).node",
                        "$(OPENCV_DIR)/<(target_arch)/vc12/bin/opencv_core310.dll",
                        "$(OPENCV_DIR)/<(target_arch)/vc12/bin/opencv_videoio310.dll",
                        "$(OPENCV_DIR)/<(target_arch)/vc12/bin/opencv_imgproc310.dll",
                        "$(OPENCV_DIR)/<(target_arch)/vc12/bin/opencv_imgcodecs310.dll",
                    ],
                    "destination": "<(module_path)"
                }
            ]
        }
    ]
}