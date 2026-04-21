#!/usr/bin/env python3
"""Subnet Calculator GUI — PyQt6"""

import ipaddress
import sys
from PyQt6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
    QLabel, QLineEdit, QPushButton, QTabWidget, QTableWidget,
    QTableWidgetItem, QHeaderView, QSpinBox, QFrame, QScrollArea,
    QSizePolicy, QStatusBar,
)
from PyQt6.QtCore import Qt, QSize
from PyQt6.QtGui import QFont, QColor, QPalette

DARK_BG   = "#1e1e2e"
PANEL_BG  = "#2a2a3e"
ENTRY_BG  = "#313145"
ACCENT    = "#89b4fa"
GREEN     = "#a6e3a1"
RED       = "#f38ba8"
YELLOW    = "#f9e2af"
FG        = "#cdd6f4"
FG_DIM    = "#6c7086"

STYLE = f"""
QMainWindow, QWidget {{
    background-color: {DARK_BG};
    color: {FG};
    font-family: "JetBrains Mono", monospace;
    font-size: 10pt;
}}
QLineEdit, QSpinBox {{
    background-color: {ENTRY_BG};
    color: {FG};
    border: none;
    border-radius: 4px;
    padding: 6px 10px;
    font-size: 11pt;
    font-weight: bold;
}}
QPushButton {{
    background-color: {PANEL_BG};
    color: {ACCENT};
    border: none;
    border-radius: 4px;
    padding: 6px 16px;
    font-size: 10pt;
}}
QPushButton:hover {{ background-color: {ENTRY_BG}; }}
QPushButton#secondary {{ color: {FG_DIM}; }}
QTabWidget::pane {{ border: none; background: {DARK_BG}; }}
QTabBar::tab {{
    background: {PANEL_BG}; color: {FG_DIM};
    padding: 8px 20px; border: none; border-radius: 0;
}}
QTabBar::tab:selected {{ background: {ENTRY_BG}; color: {ACCENT}; }}
QTableWidget {{
    background-color: {PANEL_BG};
    alternate-background-color: {ENTRY_BG};
    color: {FG};
    gridline-color: {DARK_BG};
    border: none;
    border-radius: 4px;
}}
QTableWidget::item:selected {{
    background-color: {ACCENT};
    color: {DARK_BG};
}}
QHeaderView::section {{
    background-color: {ENTRY_BG};
    color: {ACCENT};
    padding: 6px;
    border: none;
    font-weight: bold;
}}
QScrollBar:vertical {{
    background: {PANEL_BG}; width: 8px; border: none;
}}
QScrollBar::handle:vertical {{
    background: {ENTRY_BG}; border-radius: 4px;
}}
QStatusBar {{ background: {DARK_BG}; color: {FG_DIM}; font-size: 9pt; }}
QLabel#header {{ font-size: 14pt; font-weight: bold; color: {ACCENT}; }}
QLabel#key   {{ color: {FG_DIM}; min-width: 180px; }}
QLabel#value {{ color: {FG}; font-weight: bold; }}
QLabel#value_green {{ color: {GREEN}; font-weight: bold; }}
"""


def fmt_bin(ip_int: int) -> str:
    b = format(ip_int, '032b')
    return '.'.join(b[i:i+8] for i in range(0, 32, 8))


def net_class(ip: ipaddress.IPv4Address) -> str:
    f = int(ip) >> 24
    if f < 128:  return "A"
    if f < 192:  return "B"
    if f < 224:  return "C"
    if f < 240:  return "D (Multicast)"
    return "E (Reserviert)"


def net_type(net: ipaddress.IPv4Network) -> str:
    if net.is_private:    return "Privat (RFC 1918)"
    if net.is_loopback:   return "Loopback"
    if net.is_link_local: return "Link-Local"
    if net.is_multicast:  return "Multicast"
    return "Öffentlich"


class SubnetApp(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Subnetzrechner")
        self.setMinimumSize(720, 560)
        self.setStyleSheet(STYLE)
        self._net = None

        central = QWidget()
        self.setCentralWidget(central)
        root = QVBoxLayout(central)
        root.setContentsMargins(20, 16, 20, 8)
        root.setSpacing(10)

        # Header
        hdr = QLabel("Subnetzrechner")
        hdr.setObjectName("header")
        root.addWidget(hdr)

        # Input row
        row = QHBoxLayout()
        row.setSpacing(8)
        lbl = QLabel("IP / CIDR:")
        lbl.setObjectName("key")
        lbl.setMaximumWidth(80)
        row.addWidget(lbl)

        self.entry = QLineEdit("192.168.1.0/24")
        self.entry.setMinimumWidth(220)
        self.entry.returnPressed.connect(self._calculate)
        row.addWidget(self.entry)

        btn_calc = QPushButton("Berechnen")
        btn_calc.clicked.connect(self._calculate)
        row.addWidget(btn_calc)

        btn_reset = QPushButton("Zurücksetzen")
        btn_reset.setObjectName("secondary")
        btn_reset.clicked.connect(self._reset)
        row.addWidget(btn_reset)
        row.addStretch()
        root.addLayout(row)

        # Tabs
        tabs = QTabWidget()
        root.addWidget(tabs)

        tabs.addTab(self._build_info_tab(),   "  Info  ")
        tabs.addTab(self._build_split_tab(),  "  Aufteilen  ")
        tabs.addTab(self._build_binary_tab(), "  Binär  ")

        # Status bar
        self.status = QStatusBar()
        self.setStatusBar(self.status)
        self.status.showMessage("Bereit.")

    # ── Info Tab ─────────────────────────────────────────────────────────────

    def _build_info_tab(self) -> QWidget:
        w = QWidget()
        layout = QVBoxLayout(w)
        layout.setContentsMargins(16, 16, 16, 16)
        layout.setSpacing(6)

        self.info_labels = {}
        fields = [
            ("ip",        "IP-Adresse",       False),
            ("network",   "Netzwerkadresse",   False),
            ("broadcast", "Broadcastadresse",  False),
            ("netmask",   "Subnetzmaske",      False),
            ("wildcard",  "Wildcard-Maske",    False),
            ("prefix",    "Präfixlänge",       False),
            ("first",     "Erster Host",       False),
            ("last",      "Letzter Host",      False),
            ("hosts",     "Nutzbare Hosts",    True),
            ("total",     "Gesamte Adressen",  True),
            ("nclass",    "Netzklasse",        False),
            ("ntype",     "Typ",               False),
        ]
        for key, label, green in fields:
            row = QHBoxLayout()
            k = QLabel(label)
            k.setObjectName("key")
            v = QLabel("—")
            v.setObjectName("value_green" if green else "value")
            row.addWidget(k)
            row.addWidget(v)
            row.addStretch()
            layout.addLayout(row)
            self.info_labels[key] = v

        layout.addStretch()
        return w

    # ── Split Tab ─────────────────────────────────────────────────────────────

    def _build_split_tab(self) -> QWidget:
        w = QWidget()
        layout = QVBoxLayout(w)
        layout.setContentsMargins(16, 12, 16, 12)
        layout.setSpacing(10)

        ctrl = QHBoxLayout()
        ctrl.addWidget(QLabel("Aufteilen in :"))
        self.split_spin = QSpinBox()
        self.split_spin.setRange(1, 32)
        self.split_spin.setValue(26)
        self.split_spin.setFixedWidth(70)
        ctrl.addWidget(self.split_spin)
        ctrl.addWidget(QLabel("Bit-Präfix"))
        btn = QPushButton("Aufteilen")
        btn.clicked.connect(self._split)
        ctrl.addWidget(btn)
        ctrl.addStretch()
        layout.addLayout(ctrl)

        self.split_info = QLabel("")
        self.split_info.setStyleSheet(f"color: {YELLOW};")
        layout.addWidget(self.split_info)

        self.split_table = QTableWidget()
        self.split_table.setColumnCount(5)
        self.split_table.setHorizontalHeaderLabels(
            ["Nr.", "Netzwerk", "Netzwerkadresse", "Broadcast", "Hosts"])
        self.split_table.horizontalHeader().setSectionResizeMode(
            QHeaderView.ResizeMode.Stretch)
        self.split_table.setAlternatingRowColors(True)
        self.split_table.setEditTriggers(
            QTableWidget.EditTrigger.NoEditTriggers)
        self.split_table.verticalHeader().setVisible(False)
        layout.addWidget(self.split_table)
        return w

    # ── Binary Tab ────────────────────────────────────────────────────────────

    def _build_binary_tab(self) -> QWidget:
        w = QWidget()
        layout = QVBoxLayout(w)
        layout.setContentsMargins(16, 16, 16, 16)
        layout.setSpacing(14)

        note = QLabel(f"<span style='color:{ACCENT}'>■</span> Netz-Bits  "
                      f"<span style='color:{GREEN}'>■</span> Host-Bits")
        note.setTextFormat(Qt.TextFormat.RichText)
        layout.addWidget(note)

        self.bit_rows: list[list[QLabel]] = []
        row_names = ["IP-Adresse", "Netzwerk", "Subnetzmaske", "Wildcard"]

        for name in row_names:
            row_w = QWidget()
            row_l = QHBoxLayout(row_w)
            row_l.setContentsMargins(0, 0, 0, 0)
            row_l.setSpacing(0)

            name_lbl = QLabel(name)
            name_lbl.setObjectName("key")
            name_lbl.setFixedWidth(130)
            row_l.addWidget(name_lbl)

            bits: list[QLabel] = []
            for i in range(32):
                b = QLabel("0")
                b.setFont(QFont("JetBrains Mono", 9, QFont.Weight.Bold))
                b.setFixedWidth(11)
                b.setAlignment(Qt.AlignmentFlag.AlignCenter)
                b.setStyleSheet(f"color: {FG_DIM};")
                row_l.addWidget(b)
                bits.append(b)
                if i in (7, 15, 23):
                    dot = QLabel(".")
                    dot.setFixedWidth(8)
                    dot.setAlignment(Qt.AlignmentFlag.AlignCenter)
                    dot.setStyleSheet(f"color: {FG_DIM};")
                    row_l.addWidget(dot)

            row_l.addStretch()
            self.bit_rows.append(bits)
            layout.addWidget(row_w)

        layout.addStretch()
        return w

    # ── Logic ─────────────────────────────────────────────────────────────────

    def _reset(self):
        self.entry.setText("192.168.1.0/24")
        for lbl in self.info_labels.values():
            lbl.setText("—")
        self.split_table.setRowCount(0)
        self.split_info.setText("")
        self._net = None
        self.status.showMessage("Zurückgesetzt.")

    def _calculate(self):
        raw = self.entry.text().strip()
        if "/" not in raw:
            raw += "/32"
        try:
            net = ipaddress.IPv4Network(raw, strict=False)
            host_ip = ipaddress.IPv4Address(self.entry.text().strip().split("/")[0])
        except ValueError as e:
            self.status.showMessage(f"Fehler: {e}")
            return

        self._net = net
        pfx = net.prefixlen
        num_hosts = net.num_addresses - 2 if pfx < 31 else net.num_addresses
        first = net.network_address + (1 if pfx < 31 else 0)
        last  = net.broadcast_address - (1 if pfx < 31 else 0)

        data = {
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
        }
        for key, val in data.items():
            self.info_labels[key].setText(val)

        # Bit labels
        ints = [int(host_ip), int(net.network_address),
                int(net.netmask), int(net.hostmask)]
        for r, ip_int in enumerate(ints):
            bits = format(ip_int, '032b')
            for i, bit in enumerate(bits):
                color = ACCENT if i < pfx else GREEN
                self.bit_rows[r][i].setText(bit)
                self.bit_rows[r][i].setStyleSheet(f"color: {color};")

        suggested = min(pfx + 2, 30)
        self.split_spin.setValue(suggested)
        self.status.showMessage(
            f"Berechnet: {net}  |  {num_hosts:,} nutzbare Hosts  |  {net_type(net)}")

    def _split(self):
        if self._net is None:
            self._calculate()
            if self._net is None:
                return
        net = self._net
        new_pfx = self.split_spin.value()
        try:
            if new_pfx <= net.prefixlen:
                raise ValueError("Neues Präfix muss größer als das aktuelle sein")
            subnets = list(net.subnets(new_prefix=new_pfx))
        except ValueError as e:
            self.status.showMessage(f"Fehler: {e}")
            return

        limit = 512
        self.split_table.setRowCount(0)
        self.split_table.setRowCount(min(len(subnets), limit))

        for i, s in enumerate(subnets[:limit]):
            h = s.num_addresses - 2 if s.prefixlen < 31 else s.num_addresses
            for col, val in enumerate([str(i+1), str(s),
                                       str(s.network_address),
                                       str(s.broadcast_address),
                                       f"{h:,}"]):
                item = QTableWidgetItem(val)
                item.setTextAlignment(Qt.AlignmentFlag.AlignCenter)
                self.split_table.setItem(i, col, item)

        extra = f" (erste {limit} angezeigt)" if len(subnets) > limit else ""
        self.split_info.setText(
            f"{len(subnets):,} Subnetze mit je /{new_pfx}{extra}")
        self.status.showMessage(
            f"Aufgeteilt in {len(subnets):,} × /{new_pfx}-Netze")


def main():
    app = QApplication(sys.argv)
    app.setStyle("Fusion")
    win = SubnetApp()
    win.show()
    sys.exit(app.exec())


if __name__ == "__main__":
    main()
