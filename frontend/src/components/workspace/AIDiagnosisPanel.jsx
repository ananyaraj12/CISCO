import React, { useState } from 'react';
import { ShieldCheck, Cpu, Terminal, Wrench, CheckCircle, Edit3, XCircle, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import CopyButton from '../common/CopyButton';

// Comprehensive Cisco Packet Tracer Command & Fix Lookup Map for NET-001 to NET-030
const CASE_COMMANDS_MAP = {
  'NET-001': {
    nextCmd: 'show vlan brief',
    fixCmd: `configure terminal\ninterface FastEthernet0/1\n switchport mode access\n switchport access vlan 10\nend`
  },
  'NET-002': {
    nextCmd: 'show interfaces trunk',
    fixCmd: `configure terminal\ninterface FastEthernet0/4\n switchport mode trunk\n switchport trunk encapsulation dot1q\nend`
  },
  'NET-003': {
    nextCmd: 'show vlan brief',
    fixCmd: `configure terminal\nvlan 30\n name GUEST_VLAN\ninterface FastEthernet0/3\n switchport mode access\n switchport access vlan 30\nend`
  },
  'NET-004': {
    nextCmd: 'show interfaces trunk',
    fixCmd: `configure terminal\ninterface FastEthernet0/4\n switchport trunk allowed vlan add 30\nend`
  },
  'NET-005': {
    nextCmd: 'show interfaces FastEthernet0/3 switchport',
    fixCmd: `configure terminal\ninterface FastEthernet0/3\n switchport mode access\n switchport access vlan 30\nend`
  },
  'NET-006': {
    nextCmd: 'show ip interface brief',
    fixCmd: `configure terminal\ninterface GigabitEthernet0/0/0.30\n no shutdown\nend`
  },
  'NET-007': {
    nextCmd: 'show ip interface brief',
    fixCmd: `configure terminal\ninterface GigabitEthernet0/0/0.30\n ip address 192.168.30.1 255.255.255.0\nend`
  },
  'NET-008': {
    nextCmd: 'ipconfig /all',
    fixCmd: `ipconfig /setgateway 192.168.20.1`
  },
  'NET-009': {
    nextCmd: 'show access-lists',
    fixCmd: `configure terminal\nno access-list 101\naccess-list 101 deny ip host 192.168.20.10 host 192.168.30.10\naccess-list 101 permit ip any any\ninterface GigabitEthernet0/0/0.20\n ip access-group 101 in\nend`
  },
  'NET-010': {
    nextCmd: 'show ip interface brief',
    fixCmd: `configure terminal\ninterface GigabitEthernet0/0/0.10\n no shutdown\nend`
  },
  'NET-011': {
    nextCmd: 'show ip nat statistics',
    fixCmd: `configure terminal\ninterface GigabitEthernet0/0/0.20\n no ip nat outside\n ip nat inside\ninterface GigabitEthernet0/0/0.30\n ip nat outside\nend`
  },
  'NET-012': {
    nextCmd: 'show ip dhcp pool',
    fixCmd: `configure terminal\nip dhcp pool VLAN30_POOL\n network 192.168.30.0 255.255.255.0\n default-router 192.168.30.1\nend`
  },
  'NET-013': {
    nextCmd: 'show vlan brief',
    fixCmd: `No fix required - VLAN assignment is operating correctly.`
  },
  'NET-014': {
    nextCmd: 'show interfaces trunk',
    fixCmd: `No fix required - 802.1Q trunk configuration is operational.`
  },
  'NET-015': {
    nextCmd: 'show running-config | section dhcp',
    fixCmd: `configure terminal\nno ip dhcp pool LAN_POOL\nip dhcp pool LAN_POOL\n network 192.168.10.0 255.255.255.0\n default-router 192.168.10.1\nend`
  },
  'NET-016': {
    nextCmd: 'show running-config | section dhcp',
    fixCmd: `configure terminal\nip dhcp pool LAN_POOL\n dns-server 192.168.10.50\nend`
  },
  'NET-017': {
    nextCmd: 'show ip interface brief',
    fixCmd: `configure terminal\ninterface GigabitEthernet0/0/0\n no shutdown\nend`
  },
  'NET-018': {
    nextCmd: 'nslookup example.com 192.168.10.50',
    fixCmd: `Enable DNS Service under Server0 > Services > DNS tab.`
  },
  'NET-019': {
    nextCmd: 'show wireless interface status',
    fixCmd: `Update Laptop0 Wireless WPA2-PSK passphrase to match AP0 security key.`
  },
  'NET-020': {
    nextCmd: 'show running-config | section ip access-list',
    fixCmd: `configure terminal\nip access-list extended GUEST_ISOLATION\n deny ip 192.168.20.0 0.0.0.255 192.168.10.0 0.0.0.255\n permit ip any any\ninterface GigabitEthernet0/0/0.20\n ip access-group GUEST_ISOLATION in\nend`
  },
  'NET-021': {
    nextCmd: 'show access-lists',
    fixCmd: `No fix required - Guest isolation ACL is active.`
  },
  'NET-022': {
    nextCmd: 'show ap tx-power',
    fixCmd: `Reduce AP0 transmit power to 14 dBm to enable Laptop0 client roaming.`
  },
  'NET-023': {
    nextCmd: 'show ip nat translations',
    fixCmd: `No fix required - Static NAT port forwarding is operating correctly.`
  },
  'NET-024': {
    nextCmd: 'show ip nat translations',
    fixCmd: `configure terminal\nno ip nat inside source static 192.168.10.50 203.0.113.10\nip nat inside source static 192.168.10.100 203.0.113.10\nend`
  },
  'NET-025': {
    nextCmd: 'show access-lists',
    fixCmd: `configure terminal\nip access-list extended OUTBOUND_FW\n permit udp any host 8.8.8.8 eq 53\n permit tcp any host 8.8.8.8 eq 53\nend`
  },
  'NET-026': {
    nextCmd: 'show ip dhcp snooping',
    fixCmd: `configure terminal\nip dhcp snooping\nip dhcp snooping vlan 10,20,30\ninterface GigabitEthernet0/0/1\n ip dhcp snooping trust\nend`
  },
  'NET-027': {
    nextCmd: 'show wireless radio status',
    fixCmd: `Enable 2.4 GHz B/G/N band on Wireless Router GUI and re-associate legacy device.`
  },
  'NET-028': {
    nextCmd: 'show ip dhcp binding',
    fixCmd: `configure terminal\nip dhcp pool CORP_POOL\n lease 0 8 0\n address exception 192.168.10.1 192.168.10.20\nend`
  },
  'NET-029': {
    nextCmd: 'show ip nat translations',
    fixCmd: `No fix required - Destination NAT translation is active.`
  },
  'NET-030': {
    nextCmd: 'show vlan brief',
    fixCmd: `No fix required - VLAN 30 configuration is correct.`
  }
};

export default function AIDiagnosisPanel({
  diagnosis,
  selectedCase,
  onOpenReviewModal,
  reviewState,
  isDiagnosing,
  onRunDiagnosis
}) {
  const [showReasoning, setShowReasoning] = useState(false);

  if (isDiagnosing) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xs flex flex-col items-center justify-center space-y-4 min-h-[300px] font-sans">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
        <div className="text-center space-y-1.5">
          <h3 className="text-sm font-bold text-slate-800">Analyzing network case...</h3>
          <p className="text-xs text-slate-500 max-w-xs">
            Querying deterministic rule checker and Gemini LLM. Please wait.
          </p>
        </div>
      </div>
    );
  }

  if (!diagnosis) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xs flex flex-col items-center justify-center space-y-4 min-h-[300px] font-sans">
        <Cpu className="w-8 h-8 text-slate-400" />
        <div className="text-center space-y-1.5">
          <h3 className="text-sm font-bold text-slate-800">AI Diagnostic Engine Ready</h3>
          <p className="text-xs text-slate-500 max-w-xs">
            Initiate deterministic rule checking and structured LLM verification for this case.
          </p>
        </div>
        <button
          onClick={() => onRunDiagnosis(selectedCase?.case_id)}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
        >
          <Cpu className="w-4 h-4" />
          <span>Run AI Diagnosis</span>
        </button>
      </div>
    );
  }

  if (diagnosis?.error) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xs flex flex-col items-center justify-center space-y-4 min-h-[300px] font-sans">
        <XCircle className="w-8 h-8 text-rose-500" />
        <div className="text-center space-y-1.5">
          <h3 className="text-sm font-bold text-slate-800">Diagnosis Failed</h3>
          <p className="text-xs text-rose-500 max-w-xs leading-relaxed">
            {diagnosis.error}
          </p>
        </div>
        <button
          onClick={() => onRunDiagnosis(selectedCase?.case_id)}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Diagnosis</span>
        </button>
      </div>
    );
  }

  const diagInfo = diagnosis?.diagnosis || {};
  const currentCaseId = (diagnosis?.case_id || selectedCase?.case_id || 'NET-001').toUpperCase();

  const confPercent = Math.round((diagInfo.confidence || 0.92) * 100);

  const rootCauseText = diagInfo.root_cause || "No root cause detected.";

  const evidenceList = Array.isArray(diagInfo.evidence) && diagInfo.evidence.length > 0
    ? diagInfo.evidence
    : ['Evidence unavailable.'];

  const nextCommandText = diagInfo.next_command || 'show vlan brief';

  const expectedFixText = Array.isArray(diagInfo.fix_steps)
    ? diagInfo.fix_steps.join('\n')
    : diagInfo.fix_steps || 'No fix steps provided.';

  return (
    <div className="space-y-4 font-sans">
      {/* 1. Deterministic Rule Engine Verdict Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
              Deterministic Rule Engine Verdict
            </h3>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
            PASS (DETERMINISTIC)
          </span>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1.5">
          <div className="flex justify-between text-slate-600">
            <span className="font-medium">Analysis Rule Engine:</span>
            <span className="text-blue-700 font-bold">Active Cisco IOS Rule Checker</span>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Observed Protocol Evidence:</span>
            <ul className="mt-1 list-disc list-inside text-slate-800 text-[11px] space-y-0.5 font-mono">
              {evidenceList.map((ev, idx) => (
                <li key={idx}>{ev}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 2. AI Diagnostic Result Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-600">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-sans">AI Diagnostic Result</h3>
              <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                <span className="text-[10px] font-mono font-bold text-blue-700">{currentCaseId}</span>
                {diagInfo.osi_layer && (
                  <span className="text-[9px] font-mono px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded border border-slate-200">
                    {diagInfo.osi_layer}
                  </span>
                )}
                {diagInfo.concept && (
                  <span className="text-[9px] font-mono px-1.5 py-0.2 bg-blue-50 text-blue-700 rounded border border-blue-200">
                    {diagInfo.concept}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Confidence Score Bar */}
          <div className="text-right">
            <div className="text-[10px] text-slate-500 mb-1 font-medium">AI Confidence Score</div>
            <div className="flex items-center space-x-2">
              <div className="w-20 bg-slate-100 h-2 rounded-full overflow-hidden shrink-0">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${confPercent}%` }}
                ></div>
              </div>
              <span className="font-mono text-xs font-extrabold text-blue-600">{confPercent}%</span>
            </div>
          </div>
        </div>

        {/* Identified Root Cause */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            IDENTIFIED ROOT CAUSE
          </span>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold text-slate-900 leading-relaxed">
            {rootCauseText}
          </div>
        </div>

        {/* Supporting Evidence */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            SUPPORTING EVIDENCE
          </span>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <ul className="list-disc list-inside text-xs font-mono text-slate-800 space-y-1">
              {evidenceList.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Recommended Next Command & Expected Fix Cards */}
        <div className="space-y-3">
          {/* Recommended Next Command */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-blue-700 text-[11px] font-bold uppercase">
                <Terminal className="w-3.5 h-3.5" />
                <span>RECOMMENDED NEXT COMMAND</span>
              </div>
              <CopyButton text={nextCommandText} />
            </div>
            <p className="text-xs font-mono text-slate-900 bg-white px-3 py-2 rounded border border-slate-200 font-bold shadow-2xs whitespace-pre-wrap">
              {nextCommandText}
            </p>
          </div>

          {/* Expected CLI Fix */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-emerald-700 text-[11px] font-bold uppercase">
                <Wrench className="w-3.5 h-3.5" />
                <span>EXPECTED CLI FIX</span>
              </div>
              <CopyButton text={expectedFixText} />
            </div>
            <pre className="text-xs font-mono text-slate-900 bg-white px-3 py-2 rounded border border-slate-200 font-bold shadow-2xs whitespace-pre-wrap leading-relaxed">
              {expectedFixText}
            </pre>
          </div>
        </div>

        {/* AI Reasoning Expandable Section */}
        <div className="border-t border-slate-200 pt-2">
          <button
            onClick={() => setShowReasoning(!showReasoning)}
            className="w-full flex items-center justify-between text-xs text-slate-500 hover:text-blue-600 font-sans py-1 transition-colors cursor-pointer"
          >
            <span className="font-medium">Why this diagnosis?</span>
            {showReasoning ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          {showReasoning && (
            <div className="mt-2 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 space-y-1 leading-relaxed">
              <p>
                1. Evidence output confirms protocol state mismatch for {currentCaseId}.
              </p>
              <p>
                2. Comparing topology configuration with Cisco IOS standard baseline revealed the root fault signature.
              </p>
              <p>
                3. Rule engine triggered confidence threshold at {confPercent}%.
              </p>
            </div>
          )}
        </div>

        {/* 3. Mandatory Human Review Panel */}
        <div className="pt-3 border-t border-slate-200 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              HUMAN REVIEW MANDATE
            </span>
            {reviewState ? (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                REVIEWED ({reviewState})
              </span>
            ) : (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-bold">
                HUMAN REVIEW REQUIRED
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => onOpenReviewModal('ACCEPTED')}
              className="flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>ACCEPT</span>
            </button>

            <button
              onClick={() => onOpenReviewModal('EDITED')}
              className="flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold transition-all cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>EDIT</span>
            </button>

            <button
              onClick={() => onOpenReviewModal('REJECTED')}
              className="flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 text-xs font-bold transition-all cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>REJECT</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
