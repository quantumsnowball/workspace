# Rclone FAQ

## DLNA server not seen by client

1. must allow SSDP packet to pass through
    - must open port 1900/UDP for incoming packet with source address from 0.0.0.0
    - merely white list client's IP address for all protocol is NOT enough, because SSDP message is a multicast frame on the data link layer, which is handled differently
    - need to open up the specific port explicitly otherwise Linux seems to drop the packet silently by default
    - failing this step puts the server is not discoverable by the client
2. must allow the HTTP packet to pass through
    - open incoming port for 7879 (default) or any port specified by the rclone command
    - or you can simply white list the client's LAN ip to allow all ports
    - the source address should be you client's LAN ip address

