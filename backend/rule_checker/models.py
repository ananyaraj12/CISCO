from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class Interface(BaseModel):
    name: str
    status: Optional[str] = None
    ip_address: Optional[str] = None
    subnet_mask: Optional[str] = None
    vlan_id: Optional[int] = None
    switchport_mode: Optional[str] = None
    allowed_vlans: Optional[List[int]] = None

class Vlan(BaseModel):
    vlan_id: int
    name: Optional[str] = None
    status: Optional[str] = None

class Route(BaseModel):
    destination: str
    netmask: str
    next_hop: Optional[str] = None
    interface: Optional[str] = None
    protocol: Optional[str] = None

class Device(BaseModel):
    hostname: str
    device_type: Optional[str] = None
    interfaces: List[Interface] = []
    vlans: List[Vlan] = []
    routing_table: List[Route] = []
    default_gateway: Optional[str] = None

class NetworkState(BaseModel):
    devices: List[Device] = []

class RuleResult(BaseModel):
    rule_name: str
    detected: bool
    severity: str
    message: str
    evidence: Dict[str, Any]
