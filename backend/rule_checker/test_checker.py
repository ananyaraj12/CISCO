import pytest
from backend.rule_checker.models import NetworkState, Device, Interface, Vlan, Route
from backend.rule_checker.checker import NetworkRuleChecker

def test_duplicate_ips_clean():
    net = NetworkState(devices=[
        Device(hostname="R1", interfaces=[Interface(name="G0/0", ip_address="10.0.0.1", subnet_mask="255.255.255.0")]),
        Device(hostname="PC1", interfaces=[Interface(name="eth0", ip_address="10.0.0.2", subnet_mask="255.255.255.0")])
    ])
    checker = NetworkRuleChecker()
    results = checker.check_network(net)
    dup_res = next(r for r in results if r.rule_name == "duplicate_ips")
    assert not dup_res.detected

def test_duplicate_ips_detected():
    net = NetworkState(devices=[
        Device(hostname="R1", interfaces=[Interface(name="G0/0", ip_address="10.0.0.1", subnet_mask="255.255.255.0")]),
        Device(hostname="PC1", interfaces=[Interface(name="eth0", ip_address="10.0.0.1", subnet_mask="255.255.255.0")])
    ])
    checker = NetworkRuleChecker()
    results = checker.check_network(net)
    dup_res = next(r for r in results if r.rule_name == "duplicate_ips")
    assert dup_res.detected
    assert "10.0.0.1" in dup_res.evidence["duplicates"]

def test_invalid_subnet_clean():
    net = NetworkState(devices=[
        Device(hostname="R1", interfaces=[Interface(name="G0/0", ip_address="192.168.1.1", subnet_mask="255.255.255.0")])
    ])
    checker = NetworkRuleChecker()
    results = checker.check_network(net)
    sub_res = next(r for r in results if r.rule_name == "invalid_subnet")
    assert not sub_res.detected

def test_invalid_subnet_network_address():
    net = NetworkState(devices=[
        Device(hostname="R1", interfaces=[Interface(name="G0/0", ip_address="192.168.1.0", subnet_mask="255.255.255.0")])
    ])
    checker = NetworkRuleChecker()
    results = checker.check_network(net)
    sub_res = next(r for r in results if r.rule_name == "invalid_subnet")
    assert sub_res.detected
    assert any("network address" in issue["issue"] for issue in sub_res.evidence["issues"])

def test_invalid_subnet_broadcast_address():
    net = NetworkState(devices=[
        Device(hostname="R1", interfaces=[Interface(name="G0/0", ip_address="192.168.1.255", subnet_mask="255.255.255.0")])
    ])
    checker = NetworkRuleChecker()
    results = checker.check_network(net)
    sub_res = next(r for r in results if r.rule_name == "invalid_subnet")
    assert sub_res.detected
    assert any("broadcast address" in issue["issue"] for issue in sub_res.evidence["issues"])

def test_invalid_subnet_mismatch_vlan():
    net = NetworkState(devices=[
        Device(hostname="SW1", interfaces=[
            Interface(name="Fa0/1", ip_address="192.168.1.2", subnet_mask="255.255.255.0", vlan_id=10)
        ]),
        Device(hostname="SW2", interfaces=[
            Interface(name="Fa0/1", ip_address="192.168.2.2", subnet_mask="255.255.255.0", vlan_id=10)
        ])
    ])
    checker = NetworkRuleChecker()
    results = checker.check_network(net)
    sub_res = next(r for r in results if r.rule_name == "invalid_subnet")
    assert sub_res.detected
    assert any("VLAN 10" in issue["issue"] for issue in sub_res.evidence["issues"])

def test_gateway_mismatch_clean():
    net = NetworkState(devices=[
        Device(hostname="R1", interfaces=[
            Interface(name="G0/0", ip_address="192.168.1.1", subnet_mask="255.255.255.0")
        ]),
        Device(hostname="PC1", default_gateway="192.168.1.1", interfaces=[
            Interface(name="eth0", ip_address="192.168.1.10", subnet_mask="255.255.255.0")
        ])
    ])
    checker = NetworkRuleChecker()
    results = checker.check_network(net)
    gw_res = next(r for r in results if r.rule_name == "gateway_mismatch")
    assert not gw_res.detected

def test_gateway_mismatch_outside_subnet():
    net = NetworkState(devices=[
        Device(hostname="PC1", default_gateway="192.168.2.1", interfaces=[
            Interface(name="eth0", ip_address="192.168.1.10", subnet_mask="255.255.255.0")
        ])
    ])
    checker = NetworkRuleChecker()
    results = checker.check_network(net)
    gw_res = next(r for r in results if r.rule_name == "gateway_mismatch")
    assert gw_res.detected
    assert any("outside the device subnet" in issue["issue"] for issue in gw_res.evidence["issues"])

def test_gateway_mismatch_missing_active_interface():
    net = NetworkState(devices=[
        Device(hostname="PC1", default_gateway="192.168.1.1", interfaces=[
            Interface(name="eth0", ip_address="192.168.1.10", subnet_mask="255.255.255.0")
        ])
    ])
    checker = NetworkRuleChecker()
    results = checker.check_network(net)
    gw_res = next(r for r in results if r.rule_name == "gateway_mismatch")
    assert gw_res.detected
    assert any("not configured on any active device interface" in issue["issue"] for issue in gw_res.evidence["issues"])

def test_interface_down_clean():
    net = NetworkState(devices=[
        Device(hostname="R1", interfaces=[
            Interface(name="G0/0", status="up", ip_address="192.168.1.1", subnet_mask="255.255.255.0")
        ])
    ])
    checker = NetworkRuleChecker()
    results = checker.check_network(net)
    int_res = next(r for r in results if r.rule_name == "interface_down")
    assert not int_res.detected

def test_interface_down_detected():
    net = NetworkState(devices=[
        Device(hostname="R1", interfaces=[
            Interface(name="G0/0", status="down", ip_address="192.168.1.1", subnet_mask="255.255.255.0")
        ])
    ])
    checker = NetworkRuleChecker()
    results = checker.check_network(net)
    int_res = next(r for r in results if r.rule_name == "interface_down")
    assert int_res.detected
    assert len(int_res.evidence["issues"]) == 1

def test_missing_vlan_clean():
    net = NetworkState(devices=[
        Device(
            hostname="SW1",
            vlans=[Vlan(vlan_id=10, name="Sales")],
            interfaces=[Interface(name="Fa0/1", vlan_id=10)]
        )
    ])
    checker = NetworkRuleChecker()
    results = checker.check_network(net)
    vlan_res = next(r for r in results if r.rule_name == "missing_vlan")
    assert not vlan_res.detected

def test_missing_vlan_detected():
    net = NetworkState(devices=[
        Device(
            hostname="SW1",
            vlans=[Vlan(vlan_id=20, name="Marketing")],
            interfaces=[Interface(name="Fa0/1", vlan_id=10)]
        )
    ])
    checker = NetworkRuleChecker()
    results = checker.check_network(net)
    vlan_res = next(r for r in results if r.rule_name == "missing_vlan")
    assert vlan_res.detected
    assert any("VLAN 10" in issue["issue"] for issue in vlan_res.evidence["issues"])

def test_missing_vlan_trunk_detected():
    net = NetworkState(devices=[
        Device(
            hostname="SW1",
            vlans=[Vlan(vlan_id=10, name="Sales")],
            interfaces=[Interface(name="Fa0/24", switchport_mode="trunk", allowed_vlans=[10, 20])]
        )
    ])
    checker = NetworkRuleChecker()
    results = checker.check_network(net)
    vlan_res = next(r for r in results if r.rule_name == "missing_vlan")
    assert vlan_res.detected
    assert any("VLAN 20" in issue["issue"] for issue in vlan_res.evidence["issues"])

def test_missing_route_clean():
    net = NetworkState(devices=[
        Device(
            hostname="R1",
            device_type="router",
            interfaces=[
                Interface(name="G0/0", ip_address="192.168.1.1", subnet_mask="255.255.255.0"),
                Interface(name="G0/1", ip_address="10.0.0.1", subnet_mask="255.255.255.252")
            ],
            routing_table=[
                Route(destination="192.168.2.0", netmask="255.255.255.0", next_hop="10.0.0.2")
            ]
        ),
        Device(
            hostname="R2",
            device_type="router",
            interfaces=[
                Interface(name="G0/0", ip_address="192.168.2.1", subnet_mask="255.255.255.0"),
                Interface(name="G0/1", ip_address="10.0.0.2", subnet_mask="255.255.255.252")
            ],
            routing_table=[
                Route(destination="192.168.1.0", netmask="255.255.255.0", next_hop="10.0.0.1")
            ]
        )
    ])
    checker = NetworkRuleChecker()
    results = checker.check_network(net)
    route_res = next(r for r in results if r.rule_name == "missing_route")
    assert not route_res.detected

def test_missing_route_detected():
    net = NetworkState(devices=[
        Device(
            hostname="R1",
            device_type="router",
            interfaces=[
                Interface(name="G0/0", ip_address="192.168.1.1", subnet_mask="255.255.255.0"),
                Interface(name="G0/1", ip_address="10.0.0.1", subnet_mask="255.255.255.252")
            ],
            routing_table=[]
        ),
        Device(
            hostname="R2",
            device_type="router",
            interfaces=[
                Interface(name="G0/0", ip_address="192.168.2.1", subnet_mask="255.255.255.0"),
                Interface(name="G0/1", ip_address="10.0.0.2", subnet_mask="255.255.255.252")
            ],
            routing_table=[
                Route(destination="192.168.1.0", netmask="255.255.255.0", next_hop="10.0.0.1")
            ]
        )
    ])
    checker = NetworkRuleChecker()
    results = checker.check_network(net)
    route_res = next(r for r in results if r.rule_name == "missing_route")
    assert route_res.detected
    assert any("192.168.2.0/24" in issue["missing_subnet"] for issue in route_res.evidence["issues"])
