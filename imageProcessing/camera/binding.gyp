{
    "targets": [
        {
            "target_name": "camera",
            "sources": [
                "./src/camera.cc",
                "./src/camera_class.cxx"
            ],
            'include_dirs': [
                '$(OPENCV_DIR)/include',
            ],
            'link_settings': {
                'library_dirs': ['$(OPENCV_DIR)/x64/vc12/lib'],
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
        }
    ]
}