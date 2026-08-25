# Worked Examples

The following examples demonstrate how to diagnose network issues using the symptom, topology, show-command outputs, and rule checker results, and output the required structured JSON format.

---

## Example 1: Missing Route to Destination

### INPUT

#### Symptom
PC1 (192.168.1.10) cannot reach the server ServerA (192.168.2.100). Pings from PC1 time out.

#### Topology Note
PC1 (192.168.1.10/24, gateway 192.168.1.1) is connected to Router R1 (GigabitEthernet0/0: 192.168.1.1/24). R1 connects to R2 via a point-to-point link on GigabitEthernet0/1 (10.0.0.1/30). R2's GigabitEthernet0/1 is 10.0.0.2/30. R2's GigabitEthernet0/0 is 192.168.2.1/24, which connects to ServerA (192.168.2.100/24, gateway 192.168.2.1).

#### Show-Command Evidence
```text
R1# show ip route
Codes: C - connected, S - static, R - RIP, M - mobile, B - BGP
       D - EIGRP, EX - EIGRP external, O - OSPF, IA - OSPF inter area

Gateway of last resort is not set

     10.0.0.0/8 is subnetted, 1 subnets
C       10.0.0.0/30 is directly connected, GigabitEthernet0/1
     192.168.1.0/24 is subnetted, 1 subnets
C       192.168.1.0/24 is directly connected, GigabitEthernet0/0
```

#### Rule Checker Results
```json
[
  {
    "rule_name": "missing_route",
    "detected": true,
    "severity": "high",
    "message": "Missing routes to remote subnets detected.",
    "evidence": {
      "issues": [
        {
          "device": "R1",
          "missing_subnet": "192.168.2.0/24",
          "issue": "No route to destination subnet 192.168.2.0/24 found in routing table."
        }
      ]
    }
  }
]
```

### OUTPUT

```json
{
  "root_cause": "Router R1 is missing a route to the destination network 192.168.2.0/24.",
  "confidence": 1.0,
  "evidence": [
    "R1's routing table output does not show any route covering the 192.168.2.0/24 subnet or a default route.",
    "Deterministic Rule Checker flagged missing_route on R1 for subnet 192.168.2.0/24."
  ],
  "next_command": "show ip route",
  "fix_steps": [
    "Configure a static route on R1 for the 192.168.2.0/24 network pointing to R2's interface IP (10.0.0.2):",
    "R1# configure terminal",
    "R1(config)# ip route 192.168.2.0 255.255.255.0 10.0.0.2"
  ],
  "osi_layer": "Network (Layer 3)",
  "concept": "Static Routing"
}
```

---

## Example 2: Gateway Outside Device Subnet

### INPUT

#### Symptom
PC-A cannot connect to any services outside its local subnet (e.g. DNS pings fail).

#### Topology Note
PC-A (IP: 192.168.1.50, Subnet Mask: 255.255.255.0, Default Gateway: 192.168.2.1) is connected to a local switch. The local router gateway is R1 (192.168.1.1/24).

#### Show-Command Evidence
```text
PC-A> ipconfig
FastEthernet0 Connection-specific DNS Suffix:
IP Address. . . . . . . . . . . . : 192.168.1.50
Subnet Mask . . . . . . . . . . . : 255.255.255.0
Default Gateway . . . . . . . . . : 192.168.2.1
```

#### Rule Checker Results
```json
[
  {
    "rule_name": "gateway_mismatch",
    "detected": true,
    "severity": "high",
    "message": "Default gateway configuration issues detected.",
    "evidence": {
      "issues": [
        {
          "device": "PC-A",
          "default_gateway": "192.168.2.1",
          "device_subnets": [
            "192.168.1.0/24"
          ],
          "issue": "Default gateway is outside the device subnet."
        }
      ]
    }
  }
]
```

### OUTPUT

```json
{
  "root_cause": "The default gateway IP 192.168.2.1 is outside PC-A's local subnet 192.168.1.0/24.",
  "confidence": 1.0,
  "evidence": [
    "PC-A ipconfig shows IP 192.168.1.50 and Subnet Mask 255.255.255.0.",
    "PC-A is configured with Gateway 192.168.2.1, which is not inside the local subnet range (192.168.1.1 to 192.168.1.254).",
    "Rule Checker detected gateway_mismatch for PC-A."
  ],
  "next_command": "show ip interface brief",
  "fix_steps": [
    "Log onto PC-A configuration settings.",
    "Modify the default gateway setting to match the actual gateway address on the local router (192.168.1.1)."
  ],
  "osi_layer": "Network (Layer 3)",
  "concept": "IP Subnetting and Default Gateway"
}
```

---

## Example 3: Missing VLAN in Switch Database

### INPUT

#### Symptom
PC-B connected to switch SW1 interface FastEthernet0/5 is unable to communicate with any other hosts.

#### Topology Note
PC-B is configured on VLAN 20. Switch SW1's port FastEthernet0/5 is configured to access VLAN 20.

#### Show-Command Evidence
```text
SW1# show vlan brief

VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active    Fa0/1, Fa0/2, Fa0/3, Fa0/4,
                                                Fa0/6, Fa0/7, Fa0/8, Fa0/9
1002 fddi-default                     active    
1003 token-ring-default               active    
1004 fddinet-default                  active    
1005 trnet-default                    active    

SW1# show run interface FastEthernet0/5
interface FastEthernet0/5
 switchport access vlan 20
 switchport mode access
```

#### Rule Checker Results
```json
[
  {
    "rule_name": "missing_vlan",
    "detected": true,
    "severity": "high",
    "message": "Missing VLAN configurations detected.",
    "evidence": {
      "issues": [
        {
          "device": "SW1",
          "interface": "FastEthernet0/5",
          "vlan_id": 20,
          "issue": "VLAN 20 is assigned to interface but is missing from device VLAN database."
        }
      ]
    }
  }
]
```

### OUTPUT

```json
{
  "root_cause": "VLAN 20 is assigned to interface FastEthernet0/5 but has not been created in switch SW1's VLAN database.",
  "confidence": 1.0,
  "evidence": [
    "SW1 interface FastEthernet0/5 configuration shows switchport access vlan 20.",
    "SW1 show vlan brief command output does not list VLAN 20.",
    "Rule Checker flagged missing_vlan on SW1 for interface FastEthernet0/5."
  ],
  "next_command": "show vlan brief",
  "fix_steps": [
    "Log into switch SW1.",
    "SW1# configure terminal",
    "SW1(config)# vlan 20",
    "SW1(config-vlan)# name Users_VLAN",
    "SW1(config-vlan)# end"
  ],
  "osi_layer": "Data Link (Layer 2)",
  "concept": "VLAN Database Configuration"
}
```
