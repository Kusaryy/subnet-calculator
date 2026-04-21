#!/usr/bin/env python3
"""Subnet Calculator — supports IPv4 CIDR notation and subnet mask input."""

import ipaddress
import sys


def format_binary(ip_int: int, bits: int = 32) -> str:
    binary = format(ip_int, f'0{bits}b')
    return '.'.join(binary[i:i+8] for i in range(0, 32, 8))


def calculate_subnet(cidr: str) -> None:
    try:
        network = ipaddress.IPv4Network(cidr, strict=False)
    except ValueError as e:
        print(f"Fehler: {e}")
        sys.exit(1)

    host_ip = ipaddress.IPv4Address(cidr.split('/')[0])
    num_hosts = network.num_addresses - 2 if network.prefixlen < 31 else network.num_addresses
    first_host = network.network_address + 1 if network.prefixlen < 31 else network.network_address
    last_host = network.broadcast_address - 1 if network.prefixlen < 31 else network.broadcast_address

    print()
    print("=" * 52)
    print(f"  Subnetzrechner — {cidr}")
    print("=" * 52)
    print(f"  {'IP-Adresse':<22} {host_ip}")
    print(f"  {'Netzwerkadresse':<22} {network.network_address}")
    print(f"  {'Broadcastadresse':<22} {network.broadcast_address}")
    print(f"  {'Subnetzmaske':<22} {network.netmask}")
    print(f"  {'Wildcard-Maske':<22} {network.hostmask}")
    print(f"  {'Präfixlänge':<22} /{network.prefixlen}")
    print(f"  {'Erster Host':<22} {first_host}")
    print(f"  {'Letzter Host':<22} {last_host}")
    print(f"  {'Nutzbare Hosts':<22} {num_hosts:,}")
    print(f"  {'Gesamte Adressen':<22} {network.num_addresses:,}")
    print()
    print(f"  {'Netzklasse':<22} {get_class(network.network_address)}")
    print(f"  {'Typ':<22} {get_type(network)}")
    print()
    print(f"  Binär:")
    print(f"    IP-Adresse  : {format_binary(int(host_ip))}")
    print(f"    Netzwerk    : {format_binary(int(network.network_address))}")
    print(f"    Subnetzmaske: {format_binary(int(network.netmask))}")
    print("=" * 52)
    print()


def get_class(ip: ipaddress.IPv4Address) -> str:
    first_octet = int(ip) >> 24
    if first_octet < 128:
        return "A"
    elif first_octet < 192:
        return "B"
    elif first_octet < 224:
        return "C"
    elif first_octet < 240:
        return "D (Multicast)"
    else:
        return "E (Reserviert)"


def get_type(network: ipaddress.IPv4Network) -> str:
    if network.is_private:
        return "Privat (RFC 1918)"
    elif network.is_loopback:
        return "Loopback"
    elif network.is_link_local:
        return "Link-Local"
    elif network.is_multicast:
        return "Multicast"
    else:
        return "Öffentlich"


def split_subnet(cidr: str, new_prefix: int) -> None:
    try:
        network = ipaddress.IPv4Network(cidr, strict=False)
        subnets = list(network.subnets(new_prefix=new_prefix))
    except ValueError as e:
        print(f"Fehler: {e}")
        sys.exit(1)

    print()
    print(f"  Aufteilung von {network} in /{new_prefix}-Netze ({len(subnets)} Subnetze):")
    print("  " + "-" * 48)
    for i, subnet in enumerate(subnets[:64]):
        hosts = subnet.num_addresses - 2 if subnet.prefixlen < 31 else subnet.num_addresses
        print(f"  {i+1:>3}. {str(subnet):<20} Hosts: {hosts:>6,}")
    if len(subnets) > 64:
        print(f"  ... und {len(subnets) - 64} weitere Subnetze")
    print()


def summarize_subnets(networks: list[str]) -> None:
    try:
        parsed = [ipaddress.IPv4Network(n, strict=False) for n in networks]
        summary = list(ipaddress.collapse_addresses(parsed))
    except ValueError as e:
        print(f"Fehler: {e}")
        sys.exit(1)

    print()
    print("  Zusammengefasste Netzwerke:")
    for net in summary:
        print(f"    {net}")
    print()


def interactive_mode() -> None:
    print()
    print("  Subnetzrechner — Interaktiver Modus")
    print("  Befehle: 'calc <CIDR>', 'split <CIDR> <Präfix>', 'sum <N1> <N2> ...', 'exit'")
    print()

    while True:
        try:
            line = input("  > ").strip()
        except (EOFError, KeyboardInterrupt):
            print()
            break

        if not line:
            continue

        parts = line.split()
        cmd = parts[0].lower()

        if cmd in ("exit", "quit", "q"):
            break
        elif cmd == "calc" and len(parts) >= 2:
            calculate_subnet(parts[1])
        elif cmd == "split" and len(parts) >= 3:
            split_subnet(parts[1], int(parts[2]))
        elif cmd == "sum" and len(parts) >= 3:
            summarize_subnets(parts[1:])
        else:
            print("  Unbekannter Befehl. Beispiele:")
            print("    calc 192.168.1.0/24")
            print("    split 10.0.0.0/8 16")
            print("    sum 192.168.0.0/25 192.168.0.128/25")
            print()


def print_help() -> None:
    print("""
Verwendung:
  python subnet_calculator.py <CIDR>               — Subnetz berechnen
  python subnet_calculator.py <CIDR> split <Prfx>  — Subnetz aufteilen
  python subnet_calculator.py sum <N1> <N2> ...    — Netze zusammenfassen
  python subnet_calculator.py                      — Interaktiver Modus

Beispiele:
  python subnet_calculator.py 192.168.1.0/24
  python subnet_calculator.py 10.0.0.0/8 split 16
  python subnet_calculator.py sum 192.168.0.0/25 192.168.0.128/25
""")


if __name__ == "__main__":
    args = sys.argv[1:]

    if not args:
        interactive_mode()
    elif args[0] in ("-h", "--help"):
        print_help()
    elif args[0] == "sum":
        summarize_subnets(args[1:])
    elif len(args) == 1:
        calculate_subnet(args[0])
    elif len(args) == 3 and args[1] == "split":
        calculate_subnet(args[0])
        split_subnet(args[0], int(args[2]))
    else:
        print_help()
        sys.exit(1)
