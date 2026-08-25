from typing import List
from backend.rule_checker.models import NetworkState, RuleResult
from backend.rule_checker.checks import (
    check_duplicate_ips,
    check_invalid_subnet,
    check_gateway_mismatch,
    check_interface_down,
    check_missing_vlan,
    check_missing_route
)

class NetworkRuleChecker:
    def check_network(self, network: NetworkState) -> List[RuleResult]:
        return [
            check_duplicate_ips(network),
            check_invalid_subnet(network),
            check_gateway_mismatch(network),
            check_interface_down(network),
            check_missing_vlan(network),
            check_missing_route(network)
        ]
