# Copyright (C)2018, 2020 International Business Machines Corporation and  
# others. All Rights Reserved.                        
.PHONY: build all distributed clean 

# Please point this to your correct CPPWS toolkit location.
STREAMS_CPPWS_TOOLKIT ?= $(PWD)/../../com.ibm.streamsx.cppws

SPLC_FLAGS ?= 
SPLC = $(STREAMS_INSTALL)/bin/sc
SPL_CMD_ARGS ?= 
SPL_MAIN_COMPOSITE = com.ibm.streamsx.cppws.sample::HttpPostTester
SPLC_FLAGS = -a
TOOLKIT_PATH = $(STREAMS_CPPWS_TOOLKIT)
DATA_DIR = data
OUTPUT_DIR = output

build: distributed

all: distributed

distributed:
	$(SPLC) $(SPLC_FLAGS) -M $(SPL_MAIN_COMPOSITE) -t ${TOOLKIT_PATH} --data-dir $(DATA_DIR) --output-dir $(OUTPUT_DIR) $(SPL_CMD_ARGS)

clean:
	$(SPLC) $(SPLC_FLAGS) -M $(SPL_MAIN_COMPOSITE) -t ${TOOLKIT_PATH} --data-dir $(DATA_DIR) --output-dir $(OUTPUT_DIR) -C $(SPL_CMD_ARGS)
	rm -rf output
