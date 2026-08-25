import ipaddress
from typing import List, Dict, Any, Set
from backend.rule_checker.models import NetworkState, RuleResult, Device, Interface

def check_duplicate_ips(network: NetworkState) -> RuleResult:
    ip_to_interfaces = {}
    for device in network.devices:
        for interface in device.interfaces:
            if interface.ip_address:
                ip = interface.ip_address.strip()
                if ip not in ip_to_interfaces:
                    ip_to_interfaces[ip] = []
                ip_to_interfaces[ip].append({
                    "device": device.hostname,
                    "interface": interface.name
                })
    
    duplicates = {ip: locations for ip, locations in ip_to_interfaces.items() if len(locations) > 1}
    
    if duplicates:
        return RuleResult(
            rule_name="duplicate_ips",
            detected=True,
            severity="high",
            message=f"Duplicate IP addresses detected: {', '.join(duplicates.keys())}",
            evidence={"duplicates": duplicates}
        )
    
    return RuleResult(
        rule_name="duplicate_ips",
        detected=False,
        severity="low",
        message="No duplicate IP addresses detected.",
        evidence={}
    )

def check_invalid_subnet(network: NetworkState) -> RuleResult:
    issues = []
    vlan_subnets = {}
    
    for device in network.devices:
        for interface in device.interfaces:
            if not interface.ip_address and not interface.subnet_mask:
                continue
            
            if interface.ip_address and not interface.subnet_mask:
                issues.append({
                    "device": device.hostname,
                    "interface": interface.name,
                    "issue": "IP address configured without subnet mask."
                })
                continue
            
            if interface.subnet_mask and not interface.ip_address:
                issues.append({
                    "device": device.hostname,
                    "interface": interface.name,
                    "issue": "Subnet mask configured without IP address."
                })
                continue
            
            try:
                ip = interface.ip_address.strip()
                mask = interface.subnet_mask.strip()
                interface_obj = ipaddress.IPv4Interface(f"{ip}/{mask}")
                net = interface_obj.network
                
                if net.prefixlen < 31:
                    if interface_obj.ip == net.network_address:
                        issues.append({
                            "device": device.hostname,
                            "interface": interface.name,
                            "ip_address": ip,
                            "subnet_mask": mask,
                            "issue": "IP address is the network address."
                        })
                    elif interface_obj.ip == net.broadcast_address:
                        issues.append({
                            "device": device.hostname,
                            "interface": interface.name,
                            "ip_address": ip,
                            "subnet_mask": mask,
                            "issue": "IP address is the broadcast address."
                        })
                
                if interface.vlan_id is not None:
                    vlan = interface.vlan_id
                    if vlan not in vlan_subnets:
                        vlan_subnets[vlan] = []
                    vlan_subnets[vlan].append({
                        "device": device.hostname,
                        "interface": interface.name,
                        "network": str(net)
                    })
                    
            except Exception as e:
                issues.append({
                    "device": device.hostname,
                    "interface": interface.name,
                    "ip_address": interface.ip_address,
                    "subnet_mask": interface.subnet_mask,
                    "issue": f"Invalid IP/subnet configuration: {str(e)}"
                })
    
    for vlan, interfaces in vlan_subnets.items():
        networks = {item["network"] for item in interfaces}
        if len(networks) > 1:
            issues.append({
                "vlan_id": vlan,
                "issue": f"Subnet mismatch in VLAN {vlan}.",
                "interfaces": interfaces
            })
            
    if issues:
        return RuleResult(
            rule_name="invalid_subnet",
            detected=True,
            severity="high",
            message="Invalid subnet configurations or subnet mismatches detected.",
            evidence={"issues": issues}
        )
        
    return RuleResult(
        rule_name="invalid_subnet",
        detected=False,
        severity="low",
        message="All subnets are validly configured.",
        evidence={}
    )

def check_gateway_mismatch(network: NetworkState) -> RuleResult:
    issues = []
    active_ips = set()
    
    for device in network.devices:
        for interface in device.interfaces:
            if interface.ip_address:
                active_ips.add(interface.ip_address.strip())
                
    for device in network.devices:
        if not device.default_gateway:
            continue
            
        gateway_ip = device.default_gateway.strip()
        
        device_subnets = []
        for interface in device.interfaces:
            if interface.ip_address and interface.subnet_mask:
                try:
                    ip = interface.ip_address.strip()
                    mask = interface.subnet_mask.strip()
                    device_subnets.append(ipaddress.IPv4Interface(f"{ip}/{mask}").network)
                except Exception:
                    pass
                    
        in_local_subnet = False
        try:
            gw_addr = ipaddress.IPv4Address(gateway_ip)
            for subnet in device_subnets:
                if gw_addr in subnet:
                    in_local_subnet = True
                    break
        except Exception as e:
            issues.append({
                "device": device.hostname,
                "default_gateway": gateway_ip,
                "issue": f"Invalid gateway IP address format: {str(e)}"
            })
            continue
            
        if not in_local_subnet:
            issues.append({
                "device": device.hostname,
                "default_gateway": gateway_ip,
                "device_subnets": [str(s) for s in device_subnets],
                "issue": "Default gateway is outside the device subnet."
            })
        elif gateway_ip not in active_ips:
            issues.append({
                "device": device.hostname,
                "default_gateway": gateway_ip,
                "issue": "Gateway IP is not configured on any active device interface in the network."
            })
            
    if issues:
        return RuleResult(
            rule_name="gateway_mismatch",
            detected=True,
            severity="high",
            message="Default gateway configuration issues detected.",
            evidence={"issues": issues}
        )
        
    return RuleResult(
        rule_name="gateway_mismatch",
        detected=False,
        severity="low",
        message="No default gateway mismatches detected.",
        evidence={}
    )

def check_interface_down(network: NetworkState) -> RuleResult:
    issues = []
    
    for device in network.devices:
        for interface in device.interfaces:
            status = (interface.status or "").strip().lower()
            if status in ["down", "administratively down", "admin down"]:
                has_config = (
                    interface.ip_address is not None or
                    interface.vlan_id is not None or
                    interface.switchport_mode is not None
                )
                if has_config:
                    issues.append({
                        "device": device.hostname,
                        "interface": interface.name,
                        "status": interface.status,
                        "ip_address": interface.ip_address,
                        "vlan_id": interface.vlan_id,
                        "switchport_mode": interface.switchport_mode
                    })
                    
    if issues:
        return RuleResult(
            rule_name="interface_down",
            detected=True,
            severity="medium",
            message="One or more configured interfaces are down.",
            evidence={"issues": issues}
        )
        
    return RuleResult(
        rule_name="interface_down",
        detected=False,
        severity="low",
        message="All configured interfaces are up.",
        evidence={}
    )

def check_missing_vlan(network: NetworkState) -> RuleResult:
    issues = []
    
    for device in network.devices:
        configured_vlan_ids = {v.vlan_id for v in device.vlans}
        
        for interface in device.interfaces:
            if interface.vlan_id is not None:
                if interface.vlan_id != 1 and interface.vlan_id not in configured_vlan_ids:
                    issues.append({
                        "device": device.hostname,
                        "interface": interface.name,
                        "vlan_id": interface.vlan_id,
                        "issue": f"VLAN {interface.vlan_id} is assigned to interface but is missing from device VLAN database."
                    })
                    
            if interface.allowed_vlans is not None:
                for vlan_id in interface.allowed_vlans:
                    if vlan_id != 1 and vlan_id not in configured_vlan_ids:
                        issues.append({
                            "device": device.hostname,
                            "interface": interface.name,
                            "allowed_vlan": vlan_id,
                            "issue": f"VLAN {vlan_id} is allowed on trunk but is missing from device VLAN database."
                        })
                        
    if issues:
        return RuleResult(
            rule_name="missing_vlan",
            detected=True,
            severity="high",
            message="Missing VLAN configurations detected.",
            evidence={"issues": issues}
        )
        
    return RuleResult(
        rule_name="missing_vlan",
        detected=False,
        severity="low",
        message="No missing VLANs detected.",
        evidence={}
    )

def check_missing_route(network: NetworkState) -> RuleResult:
    all_subnets: Set[ipaddress.IPv4Network] = set()
    for device in network.devices:
        for interface in device.interfaces:
            if interface.ip_address and interface.subnet_mask:
                try:
                    ip = interface.ip_address.strip()
                    mask = interface.subnet_mask.strip()
                    all_subnets.add(ipaddress.IPv4Interface(f"{ip}/{mask}").network)
                except Exception:
                    pass
                    
    issues = []
    
    for device in network.devices:
        is_routing_device = (
            device.device_type in ["router", "multilayer_switch"] or
            len(device.routing_table) > 0
        )
        if not is_routing_device:
            continue
            
        local_subnets = set()
        for interface in device.interfaces:
            if interface.ip_address and interface.subnet_mask:
                try:
                    ip = interface.ip_address.strip()
                    mask = interface.subnet_mask.strip()
                    local_subnets.add(ipaddress.IPv4Interface(f"{ip}/{mask}").network)
                except Exception:
                    pass
                    
        routes = []
        for route in device.routing_table:
            try:
                dest = route.destination.strip()
                mask = route.netmask.strip()
                routes.append(ipaddress.IPv4Network(f"{dest}/{mask}"))
            except Exception:
                pass
                
        for subnet in all_subnets:
            if subnet in local_subnets:
                continue
                
            has_route = False
            for route_net in routes:
                if route_net.supernet_of(subnet) or route_net == subnet:
                    has_route = True
                    break
                    
            if not has_route:
                issues.append({
                    "device": device.hostname,
                    "missing_subnet": str(subnet),
                    "issue": f"No route to destination subnet {subnet} found in routing table."
                })
                
    if issues:
        return RuleResult(
            rule_name="missing_route",
            detected=True,
            severity="high",
            message="Missing routes to remote subnets detected.",
            evidence={"issues": issues}
        )
        
    return RuleResult(
        rule_name="missing_route",
        detected=False,
        severity="low",
        message="All subnets are reachable via configured routes.",
        evidence={}
    )
