# Copyright (C)2018, 2020 International Business Machines Corporation and  
# others. All Rights Reserved.                        
.PHONY: build all distributed clean

# Please point this to your correct WebSocket toolkit location.
STREAMS_WEBSOCKET_TOOLKIT ?= $(PWD)/../../com.ibm.streamsx.websocket
STREAMS_JSON_TOOLKIT ?= $(STREAMS_INSTALL)/toolkits/com.ibm.streamsx.json
# Please point this to your correct GeoSpatial toolkit location.
STREAMS_GEOSPATIAL_TOOLKIT ?= $(HOME)/com.ibm.streams.geospatial

$(info build use env settings)
ifndef STREAMS_INSTALL
   $(error require streams environment STREAMS_INSTALL)
endif
SPLC = $(STREAMS_INSTALL)/bin/sc
DATA_DIR = data
OUTPUT_DIR = output
TOOLKIT_PATH = $(STREAMS_WEBSOCKET_TOOLKIT):$(STREAMS_JSON_TOOLKIT):$(STREAMS_GEOSPATIAL_TOOLKIT)

SPL_MAIN_COMPOSITE = com.ibm.streamsx.websocket.sample::TaxiMetrics
SPLC_FLAGS = -a --c++std=c++11
SPL_CMD_ARGS ?=

build: distributed

all: clean build

distributed:
	$(SPLC) $(SPLC_FLAGS) -M $(SPL_MAIN_COMPOSITE) -t ${TOOLKIT_PATH} --data-dir $(DATA_DIR) --output-dir $(OUTPUT_DIR) $(SPL_CMD_ARGS)

clean:
	$(SPLC) $(SPLC_FLAGS) -M $(SPL_MAIN_COMPOSITE) -t ${TOOLKIT_PATH} --data-dir $(DATA_DIR) --output-dir $(OUTPUT_DIR) -C $(SPL_CMD_ARGS)
	rm -rf output
