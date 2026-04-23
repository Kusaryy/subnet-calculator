#!/usr/bin/env python3
"""Subnet Calculator GUI — tkinter"""

import ipaddress
import sys
import tkinter as tk
from tkinter import ttk

DARK_BG  = "#1e1e2e"
PANEL_BG = "#2a2a3e"
ENTRY_BG = "#313145"
ACCENT   = "#89b4fa"
GREEN    = "#a6e3a1"
YELLOW   = "#f9e2af"
FG       = "#cdd6f4"
FG_DIM   = "#6c7086"
FONT     = ("Courier", 10)
FONT_B   = ("Courier", 10, "bold")
FONT_HDR = ("Courier", 14, "bold")
FONT_BIT = ("Courier", 9, "bold")


def net_class(ip: ipaddress.IPv4Address) -> str:
    f = int(ip) >> 24
    if f < 128: return "A"
    if f < 192: return "B"
    if f < 224: return "C"
    if f < 240: return "D (Multicast)"
    return "E (Reserviert)"


def net_type(net: ipaddress.IPv4Network) -> str:
    if net.is_private:    return "Privat (RFC 1918)"
    if net.is_loopback:   return "Loopback"
    if net.is_link_local: return "Link-Local"
    if net.is_multicast:  return "Multicast"
    return "Öffentlich"


class SubnetApp:
    def __init__(self, root: tk.Tk):
        self.root = root
        self.root.title("Subnetzrechner")
        self.root.minsize(740, 580)
        self.root.configure(bg=DARK_BG)
        self._net = None
        self._setup_style()
        self._build_ui()

    def _setup_style(self):
        s = ttk.Style()
        s.theme_use("default")
        s.configure(".", background=DARK_BG, foreground=FG, font=FONT)
        s.configure("TFrame", background=DARK_BG)
        s.configure("TLabel", background=DARK_BG, foreground=FG)
        s.configure("TNotebook", background=DARK_BG, borderwidth=0)
        s.configure("TNotebook.Tab",
                    background=PANEL_BG, foreground=FG_DIM,
                    padding=(20, 8), borderwidth=0)
        s.map("TNotebook.Tab",
              background=[("selected", ENTRY_BG)],
              foreground=[("selected", ACCENT)])
        s.configure("Treeview",
                    background=PANEL_BG, foreground=FG,
                    fieldbackground=PANEL_BG, rowheight=24, borderwidth=0)
        s.configure("Treeview.Heading",
                    background=ENTRY_BG, foreground=ACCENT,
                    font=FONT_B, borderwidth=0)
        s.map("Treeview",
              background=[("selected", ACCENT)],
              foreground=[("selected", DARK_BG)])
        s.configure("Vertical.TScrollbar",
                    background=PANEL_BG, troughcolor=DARK_BG,
                    borderwidth=0, arrowsize=12)

    def _btn(self, parent, text, cmd, secondary=False):
        return tk.Button(parent, text=text, command=cmd,
                         bg=PANEL_BG, fg=FG_DIM if secondary else ACCENT,
                         relief="flat", borderwidth=0,
                         padx=12, pady=4, font=FONT, cursor="hand2",
                         activebackground=ENTRY_BG,
                         activeforeground=FG_DIM if secondary else ACCENT)

    def _build_ui(self):
        main = ttk.Frame(self.root)
        main.pack(fill="both", expand=True, padx=20, pady=(16, 6))

        tk.Label(main, text="Subnetzrechner",
                 bg=DARK_BG, fg=ACCENT, font=FONT_HDR).pack(anchor="w", pady=(0, 10))

        inp = ttk.Frame(main)
        inp.pack(fill="x", pady=(0, 10))

        tk.Label(inp, text="IP / CIDR:", bg=DARK_BG, fg=FG_DIM, font=FONT).pack(side="left", padx=(0, 8))
        self.entry = tk.Entry(inp, bg=ENTRY_BG, fg=FG, insertbackground=FG,
                              relief="flat", bd=4, font=("Courier", 11, "bold"), width=24)
        self.entry.insert(0, "192.168.1.0/24")
        self.entry.pack(side="left", padx=(0, 8))
        self.entry.bind("<Return>", lambda _: self._calculate())

        self._btn(inp, "Berechnen",    self._calculate).pack(side="left", padx=(0, 6))
        self._btn(inp, "Zurücksetzen", self._reset, secondary=True).pack(side="left")

        nb = ttk.Notebook(main)
        nb.pack(fill="both", expand=True)

        for title, builder in [
            ("  Info  ",      self._build_info_tab),
            ("  Aufteilen  ", self._build_split_tab),
            ("  Binär  ",     self._build_binary_tab),
        ]:
            tab = ttk.Frame(nb)
            nb.add(tab, text=title)
            builder(tab)

        self.status_var = tk.StringVar(value="Bereit.")
        tk.Label(self.root, textvariable=self.status_var,
                 bg=DARK_BG, fg=FG_DIM, font=("Courier", 9),
                 anchor="w", padx=8).pack(fill="x", side="bottom")

    def _build_info_tab(self, parent):
        frame = ttk.Frame(parent)
        frame.pack(fill="both", expand=True, padx=16, pady=16)
        self.info_labels = {}
        for key, label, green in [
            ("ip",        "IP-Adresse",      False),
            ("network",   "Netzwerkadresse",  False),
            ("broadcast", "Broadcastadresse", False),
            ("netmask",   "Subnetzmaske",     False),
            ("wildcard",  "Wildcard-Maske",   False),
            ("prefix",    "Präfixlänge",      False),
            ("first",     "Erster Host",      False),
            ("last",      "Letzter Host",     False),
            ("hosts",     "Nutzbare Hosts",   True),
            ("total",     "Gesamte Adressen", True),
            ("nclass",    "Netzklasse",       False),
            ("ntype",     "Typ",              False),
        ]:
            row = ttk.Frame(frame)
            row.pack(fill="x", pady=2)
            tk.Label(row, text=label, width=22, anchor="w",
                     bg=DARK_BG, fg=FG_DIM, font=FONT).pack(side="left")
            v = tk.Label(row, text="—", anchor="w",
                         bg=DARK_BG, fg=GREEN if green else FG, font=FONT_B)
            v.pack(side="left")
            self.info_labels[key] = v

    def _build_split_tab(self, parent):
        frame = ttk.Frame(parent)
        frame.pack(fill="both", expand=True, padx=16, pady=12)

        ctrl = ttk.Frame(frame)
        ctrl.pack(fill="x", pady=(0, 6))
        tk.Label(ctrl, text="Aufteilen in:", bg=DARK_BG, fg=FG, font=FONT).pack(side="left", padx=(0, 6))
        self.split_spin = tk.Spinbox(ctrl, from_=1, to=32, width=5,
                                     bg=ENTRY_BG, fg=FG, buttonbackground=PANEL_BG,
                                     relief="flat", bd=2, font=FONT)
        self.split_spin.delete(0, "end")
        self.split_spin.insert(0, "26")
        self.split_spin.pack(side="left", padx=(0, 6))
        tk.Label(ctrl, text="Bit-Präfix", bg=DARK_BG, fg=FG, font=FONT).pack(side="left", padx=(0, 10))
        self._btn(ctrl, "Aufteilen", self._split).pack(side="left")

        self.split_info = tk.Label(frame, text="", bg=DARK_BG, fg=YELLOW, font=("Courier", 9))
        self.split_info.pack(anchor="w", pady=(0, 6))

        tree_frame = ttk.Frame(frame)
        tree_frame.pack(fill="both", expand=True)
        cols = ("nr", "netz", "netzaddr", "broadcast", "hosts")
        self.split_tree = ttk.Treeview(tree_frame, columns=cols, show="headings", selectmode="browse")
        for col, hdr in zip(cols, ["Nr.", "Netzwerk", "Netzwerkadresse", "Broadcast", "Hosts"]):
            self.split_tree.heading(col, text=hdr)
            self.split_tree.column(col, anchor="center", minwidth=80)
        sb = ttk.Scrollbar(tree_frame, orient="vertical", command=self.split_tree.yview)
        self.split_tree.configure(yscrollcommand=sb.set)
        self.split_tree.pack(side="left", fill="both", expand=True)
        sb.pack(side="right", fill="y")

    def _build_binary_tab(self, parent):
        frame = ttk.Frame(parent)
        frame.pack(fill="both", expand=True, padx=16, pady=16)

        leg = tk.Frame(frame, bg=DARK_BG)
        leg.pack(anchor="w", pady=(0, 14))
        tk.Label(leg, text="■ ", bg=DARK_BG, fg=ACCENT, font=FONT_B).pack(side="left")
        tk.Label(leg, text="Netz-Bits   ", bg=DARK_BG, fg=FG, font=FONT).pack(side="left")
        tk.Label(leg, text="■ ", bg=DARK_BG, fg=GREEN, font=FONT_B).pack(side="left")
        tk.Label(leg, text="Host-Bits", bg=DARK_BG, fg=FG, font=FONT).pack(side="left")

        self.bit_rows: list[list[tk.Label]] = []
        for name in ("IP-Adresse", "Netzwerk", "Subnetzmaske", "Wildcard"):
            row_w = tk.Frame(frame, bg=DARK_BG)
            row_w.pack(fill="x", pady=3)
            tk.Label(row_w, text=name, width=14, anchor="w",
                     bg=DARK_BG, fg=FG_DIM, font=FONT).pack(side="left")
            bits: list[tk.Label] = []
            for i in range(32):
                b = tk.Label(row_w, text="0", width=1,
                             bg=DARK_BG, fg=FG_DIM, font=FONT_BIT)
                b.pack(side="left")
                bits.append(b)
                if i in (7, 15, 23):
                    tk.Label(row_w, text=".", bg=DARK_BG, fg=FG_DIM,
                             font=FONT_BIT).pack(side="left")
            self.bit_rows.append(bits)

    # ── Logic ──────────────────────────────────────────────────────────────────

    def _reset(self):
        self.entry.delete(0, "end")
        self.entry.insert(0, "192.168.1.0/24")
        for lbl in self.info_labels.values():
            lbl.config(text="—")
        for row in self.split_tree.get_children():
            self.split_tree.delete(row)
        self.split_info.config(text="")
        self._net = None
        self.status_var.set("Zurückgesetzt.")

    def _calculate(self):
        raw = self.entry.get().strip()
        if "/" not in raw:
            raw += "/32"
        try:
            net = ipaddress.IPv4Network(raw, strict=False)
            host_ip = ipaddress.IPv4Address(raw.split("/")[0])
        except ValueError as e:
            self.status_var.set(f"Fehler: {e}")
            return

        self._net = net
        pfx = net.prefixlen
        num_hosts = net.num_addresses - 2 if pfx < 31 else net.num_addresses
        first = net.network_address + (1 if pfx < 31 else 0)
        last  = net.broadcast_address - (1 if pfx < 31 else 0)

        for key, val in {
            "ip":        str(host_ip),
            "network":   str(net.network_address),
            "broadcast": str(net.broadcast_address),
            "netmask":   str(net.netmask),
            "wildcard":  str(net.hostmask),
            "prefix":    f"/{pfx}",
            "first":     str(first),
            "last":      str(last),
            "hosts":     f"{num_hosts:,}",
            "total":     f"{net.num_addresses:,}",
            "nclass":    net_class(net.network_address),
            "ntype":     net_type(net),
        }.items():
            self.info_labels[key].config(text=val)

        for r, ip_int in enumerate([int(host_ip), int(net.network_address),
                                     int(net.netmask), int(net.hostmask)]):
            for i, bit in enumerate(format(ip_int, "032b")):
                self.bit_rows[r][i].config(text=bit, fg=ACCENT if i < pfx else GREEN)

        self.split_spin.delete(0, "end")
        self.split_spin.insert(0, str(min(pfx + 2, 30)))
        self.status_var.set(f"Berechnet: {net}  |  {num_hosts:,} nutzbare Hosts  |  {net_type(net)}")

    def _split(self):
        if self._net is None:
            self._calculate()
            if self._net is None:
                return
        net = self._net
        try:
            new_pfx = int(self.split_spin.get())
            if new_pfx <= net.prefixlen:
                raise ValueError("Neues Präfix muss größer als das aktuelle sein")
            subnets = list(net.subnets(new_prefix=new_pfx))
        except ValueError as e:
            self.status_var.set(f"Fehler: {e}")
            return

        for row in self.split_tree.get_children():
            self.split_tree.delete(row)

        limit = 512
        for i, s in enumerate(subnets[:limit]):
            h = s.num_addresses - 2 if s.prefixlen < 31 else s.num_addresses
            self.split_tree.insert("", "end", values=(
                i + 1, str(s), str(s.network_address), str(s.broadcast_address), f"{h:,}"))

        extra = f" (erste {limit} angezeigt)" if len(subnets) > limit else ""
        self.split_info.config(text=f"{len(subnets):,} Subnetze mit je /{new_pfx}{extra}")
        self.status_var.set(f"Aufgeteilt in {len(subnets):,} × /{new_pfx}-Netze")


def main():
    root = tk.Tk()
    SubnetApp(root)
    root.mainloop()


if __name__ == "__main__":
    main()
