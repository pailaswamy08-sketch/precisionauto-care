package com.precisionauto.booking.client;

import com.precisionauto.booking.dto.CreateServiceRecordRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;

@FeignClient(name = "record-service", path = "/api/records")
public interface RecordClient {

    @PostMapping("/init")
    Map<String, Object> initializeRecord(@RequestBody CreateServiceRecordRequest request);
}
