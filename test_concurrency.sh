#!/bin/bash

request_count=1000

url="http://localhost:9001/api/v1/tag/add"

bearer_token="Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEiLCJ0b2tlblR5cGUiOiJBY2Nlc3NUb2tlbiIsImlhdCI6MTczMTk0NTEwMywiZXhwIjoxNzMyMDMxNTAzfQ.H2NbkUO-PV0pZHi5_liyZeEYjpv_gm1A_uXakpo-Ijk"

generate_random_tag() {
  echo "E28011$(printf '%06d' $((RANDOM % 1000000)))"
}

tags_array=()

for i in $(seq 1 $request_count); do
  tag=$(generate_random_tag)
  json_data=$(cat <<EOF
  {
    "Tag": "$tag",
    "DeviceNo": 0,
    "AntennaNo": 1,
    "Timestamp": "2024-11-11T00:54:27.2211364+07:00",
    "ScanCount": $((RANDOM % 100))
  }
EOF
)
  tags_array+=("$json_data")
done

json_array=$(printf ",%s" "${tags_array[@]}")
json_array="[${json_array:1}]"

echo "Sending JSON array: $json_array"

response=$(curl -s -X POST -H "Content-Type: application/json" -H "Authorization: $bearer_token" -d "$json_array" "$url")
echo "Response: $response"

echo "All $request_count requests have been sent."