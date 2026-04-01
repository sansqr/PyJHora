#!/usr/bin/env python
# -*- coding: UTF-8 -*-
# Copyright (C) Open Astro Technologies, USA.
# Modified by Sundar Sundaresan, USA. carnaticmusicguru2015@comcast.net
# Downloaded from https://github.com/naturalstupid/PyJHora

# This file is part of the "PyJHora" Python library
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.
"""
Jagannath Hora 8-style Main Window for PyJHora.

Wraps ChartTabbed in a QMainWindow with:
  - Menu bar  (File | Edit | Charts | Dhasa | Balas | Options | Tools | Help)
  - Toolbar   (quick-access icon buttons)
  - Status bar (coordinates, date/time, ayanamsa readout)
  - JHora 8 look-and-feel stylesheet
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

# img2pdf/pikepdf must be imported before PyQt6 to avoid a DLL conflict on Windows
import img2pdf  # noqa: F401 – side-effect: loads pikepdf C-extension before Qt DLLs

from PyQt6 import QtCore, QtGui
from PyQt6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QStatusBar, QToolBar,
    QMenuBar, QMenu, QMessageBox, QFileDialog, QLabel, QSizePolicy, QDialog,
    QDialogButtonBox, QTextEdit, QInputDialog, QTableWidget, QTableWidgetItem,
    QAbstractItemView, QHBoxLayout, QLineEdit, QPushButton, QHeaderView,
    QSpinBox, QDoubleSpinBox, QComboBox, QGridLayout
)
from PyQt6.QtGui import QAction, QIcon, QKeySequence, QFont, QColor, QPixmap
from PyQt6.QtCore import Qt, QTimer, QDateTime, pyqtSignal

from jhora import const, utils
from jhora._package_info import version as _APP_VERSION
from jhora.ui.horo_chart_tabs import ChartTabbed, available_chart_types, available_languages
from jhora.data.chart_db import ChartDatabase

# ──────────────────────────────────────────────────────────────────
#  JHora 8 colour palette  (classic Windows-gray + accented labels)
# ──────────────────────────────────────────────────────────────────
_JHORA_STYLESHEET = """
/* ── Application-wide base ── */
QWidget {
    background-color: #F0F0F0;
    color: #000000;
    font-family: "Arial";
    font-size: 9pt;
}

/* ── Menu bar ── */
QMenuBar {
    background-color: #D4D0C8;
    color: #000000;
    border-bottom: 1px solid #808080;
}
QMenuBar::item {
    background: transparent;
    padding: 3px 8px;
}
QMenuBar::item:selected {
    background-color: #316AC5;
    color: #FFFFFF;
}
QMenu {
    background-color: #FFFFFF;
    border: 1px solid #808080;
    color: #000000;
}
QMenu::item {
    padding: 4px 24px 4px 6px;
}
QMenu::item:selected {
    background-color: #316AC5;
    color: #FFFFFF;
}
QMenu::separator {
    height: 1px;
    background: #A0A0A0;
    margin: 2px 0;
}

/* ── Toolbar ── */
QToolBar {
    background-color: #D4D0C8;
    border-bottom: 1px solid #808080;
    spacing: 2px;
    padding: 2px;
}
QToolBar QToolButton {
    background-color: #D4D0C8;
    border: 1px solid transparent;
    border-radius: 2px;
    padding: 3px 5px;
    color: #000000;
}
QToolBar QToolButton:hover {
    background-color: #EEE8D5;
    border: 1px solid #808080;
}
QToolBar QToolButton:pressed {
    background-color: #C0BBB2;
    border: 1px solid #404040;
}
QToolBar::separator {
    width: 6px;
    background: transparent;
}

/* ── Status bar ── */
QStatusBar {
    background-color: #D4D0C8;
    border-top: 1px solid #808080;
    color: #000000;
    font-size: 8pt;
}
QStatusBar QLabel {
    padding: 0 6px;
    border-right: 1px solid #A0A0A0;
}

/* ── Tab widget ── */
QTabWidget::pane {
    border: 1px solid #808080;
    background-color: #FFFFFF;
}
QTabBar::tab {
    background-color: #D4D0C8;
    color: #000000;
    border: 1px solid #808080;
    border-bottom: none;
    padding: 3px 8px;
    min-width: 50px;
}
QTabBar::tab:selected {
    background-color: #FFFFFF;
    font-weight: bold;
    color: #00008B;
}
QTabBar::tab:hover:!selected {
    background-color: #E8E0D0;
}

/* ── Buttons ── */
QPushButton {
    background-color: #D4D0C8;
    color: #000000;
    border: 2px outset #A0A0A0;
    border-radius: 3px;
    padding: 3px 10px;
    min-height: 20px;
}
QPushButton:hover {
    background-color: #E0DDD5;
    border-color: #808080;
}
QPushButton:pressed {
    background-color: #B8B4AC;
    border-style: inset;
}
QPushButton:default {
    border-color: #316AC5;
}

/* ── Line edits / Spinboxes ── */
QLineEdit, QSpinBox, QDoubleSpinBox {
    background-color: #FFFFFF;
    color: #000000;
    border: 1px solid #808080;
    border-radius: 2px;
    padding: 1px 3px;
    selection-background-color: #316AC5;
    selection-color: #FFFFFF;
}
QLineEdit:focus, QSpinBox:focus, QDoubleSpinBox:focus {
    border-color: #316AC5;
}

/* ── ComboBox ── */
QComboBox {
    background-color: #FFFFFF;
    color: #000000;
    border: 1px solid #808080;
    border-radius: 2px;
    padding: 1px 18px 1px 3px;
    min-height: 18px;
}
QComboBox:hover { border-color: #316AC5; }
QComboBox::drop-down {
    width: 16px;
    border-left: 1px solid #808080;
}
QComboBox QAbstractItemView {
    background-color: #FFFFFF;
    selection-background-color: #316AC5;
    selection-color: #FFFFFF;
}

/* ── Table widget ── */
QTableWidget {
    background-color: #FFFFFF;
    alternate-background-color: #F5F5E8;
    gridline-color: #D0D0D0;
    color: #000000;
    selection-background-color: #CCE0FF;
    selection-color: #000000;
}
QHeaderView::section {
    background-color: #D4D0C8;
    color: #000000;
    border: 1px solid #A0A0A0;
    padding: 2px 4px;
    font-weight: bold;
}

/* ── List widget ── */
QListWidget {
    background-color: #FFFFFF;
    color: #000000;
    border: 1px solid #808080;
    alternate-background-color: #F0F0F0;
    selection-background-color: #316AC5;
    selection-color: #FFFFFF;
}

/* ── Text edit ── */
QTextEdit {
    background-color: #FFFFFF;
    color: #000000;
    border: 1px solid #808080;
    selection-background-color: #316AC5;
    selection-color: #FFFFFF;
}

/* ── Radio / Checkbox ── */
QRadioButton { spacing: 4px; color: #000000; }
QCheckBox     { spacing: 4px; color: #000000; }

/* ── Labels ── */
QLabel { color: #000000; background: transparent; }

/* ── Scroll bars ── */
QScrollBar:vertical {
    border: 1px solid #A0A0A0;
    background: #F0F0F0;
    width: 14px;
    margin: 14px 0;
}
QScrollBar::handle:vertical {
    background: #C0BBB2;
    border: 1px solid #808080;
    min-height: 20px;
    border-radius: 3px;
}
QScrollBar::handle:vertical:hover { background: #A0A0A0; }
QScrollBar::add-line:vertical, QScrollBar::sub-line:vertical {
    border: 1px solid #808080;
    background: #D4D0C8;
    height: 13px;
    subcontrol-origin: margin;
}
QScrollBar::add-line:vertical  { subcontrol-position: bottom; }
QScrollBar::sub-line:vertical  { subcontrol-position: top; }

QScrollBar:horizontal {
    border: 1px solid #A0A0A0;
    background: #F0F0F0;
    height: 14px;
    margin: 0 14px;
}
QScrollBar::handle:horizontal {
    background: #C0BBB2;
    border: 1px solid #808080;
    min-width: 20px;
    border-radius: 3px;
}
QScrollBar::handle:horizontal:hover { background: #A0A0A0; }
QScrollBar::add-line:horizontal, QScrollBar::sub-line:horizontal {
    border: 1px solid #808080;
    background: #D4D0C8;
    width: 13px;
    subcontrol-origin: margin;
}
QScrollBar::add-line:horizontal { subcontrol-position: right; }
QScrollBar::sub-line:horizontal { subcontrol-position: left; }

/* ── Splitter ── */
QSplitter::handle { background-color: #A0A0A0; }
QSplitter::handle:horizontal { width: 4px; }
QSplitter::handle:vertical   { height: 4px; }

/* ── Tool-tip ── */
QToolTip {
    background-color: #FFFFE1;
    color: #000000;
    border: 1px solid #808080;
    padding: 2px;
    font-size: 8pt;
}
"""

# ──────────────────────────────────────────────────────────────────
#  About dialog
# ──────────────────────────────────────────────────────────────────
class _AboutDialog(QDialog):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setWindowTitle(f"About PyJHora v{_APP_VERSION}")
        self.setFixedSize(480, 320)
        layout = QVBoxLayout(self)
        icon_label = QLabel()
        icon_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        try:
            pix = QPixmap(const._IMAGE_ICON_PATH).scaled(64, 64,
                          Qt.AspectRatioMode.KeepAspectRatio,
                          Qt.TransformationMode.SmoothTransformation)
            icon_label.setPixmap(pix)
        except Exception:
            pass
        layout.addWidget(icon_label)
        text = QTextEdit(readOnly=True)
        text.setHtml(f"""
        <center>
        <b style='font-size:14pt'>PyJHora</b><br/>
        <i>Version {_APP_VERSION}</i><br/><br/>
        Vedic Astrology software based on<br/>
        <b>Jagannath Hora 8</b> by PVR Narasimha Rao<br/><br/>
        Python implementation of Vedic Astrology calculations.<br/>
        Charts, Dhasas, Balas, Panchanga, Compatibility and more.<br/><br/>
        <a href='https://github.com/naturalstupid/PyJHora'>
            https://github.com/naturalstupid/PyJHora</a><br/><br/>
        <small>Licensed under GNU AGPL v3</small>
        </center>
        """)
        text.setOpenExternalLinks(True)
        layout.addWidget(text)
        buttons = QDialogButtonBox(QDialogButtonBox.StandardButton.Ok)
        buttons.accepted.connect(self.accept)
        layout.addWidget(buttons)


# ──────────────────────────────────────────────────────────────────
#  Birth Data Entry dialog
# ──────────────────────────────────────────────────────────────────
class BirthDataDialog(QDialog):
    """
    Popup dialog to enter or edit birth data before computing a horoscope.

    Fields
    ------
    Name, Gender, Date of Birth (yyyy-mm-dd), Time of Birth (hh:mm:ss),
    Place, Latitude (D° M' S" N/S), Longitude (D° M' S" E/W),
    Time Zone offset (UTC±decimal).

    ``get_data()`` returns a dict with the internal formats ready to be
    passed to ``_load_record_into_ui()``:
        dob  → "YYYY,MM,DD"   (comma-separated, as ChartTabbed expects)
        tob  → "HH:MM:SS"
        latitude / longitude → float (signed decimal degrees)
        tz_offset → float
    """

    def __init__(self, parent=None, initial_data: dict = None):
        super().__init__(parent)
        self.setWindowTitle("Birth Data")
        self.setModal(True)
        self.setMinimumWidth(520)
        self._build_ui()
        if initial_data:
            self._populate(initial_data)

    # ── UI construction ───────────────────────────────────────────
    def _build_ui(self):
        outer = QVBoxLayout(self)
        outer.setSpacing(8)
        grid = QGridLayout()
        grid.setColumnMinimumWidth(0, 130)
        grid.setHorizontalSpacing(10)
        grid.setVerticalSpacing(7)
        row = 0

        # Name
        grid.addWidget(QLabel("Name:"), row, 0)
        self._name_edit = QLineEdit()
        self._name_edit.setPlaceholderText("Full name")
        grid.addWidget(self._name_edit, row, 1, 1, 4)
        row += 1

        # Gender
        grid.addWidget(QLabel("Gender:"), row, 0)
        self._gender_combo = QComboBox()
        self._gender_combo.addItems(['Female', 'Male', 'Transgender', 'No preference'])
        grid.addWidget(self._gender_combo, row, 1, 1, 2)
        row += 1

        # Date of birth
        grid.addWidget(QLabel("Date of Birth:"), row, 0)
        self._dob_edit = QLineEdit()
        self._dob_edit.setPlaceholderText("yyyy-mm-dd")
        self._dob_edit.setMaximumWidth(110)
        grid.addWidget(self._dob_edit, row, 1)
        grid.addWidget(QLabel("(yyyy-mm-dd)"), row, 2)
        row += 1

        # Time of birth
        grid.addWidget(QLabel("Time of Birth:"), row, 0)
        self._tob_edit = QLineEdit()
        self._tob_edit.setPlaceholderText("hh:mm:ss")
        self._tob_edit.setMaximumWidth(90)
        grid.addWidget(self._tob_edit, row, 1)
        grid.addWidget(QLabel("(hh:mm:ss, 24-h)"), row, 2)
        row += 1

        # Place
        grid.addWidget(QLabel("Place:"), row, 0)
        self._place_edit = QLineEdit()
        self._place_edit.setPlaceholderText("City, Country")
        grid.addWidget(self._place_edit, row, 1, 1, 4)
        row += 1

        # Latitude  ── D° M' S" N/S
        grid.addWidget(QLabel("Latitude:"), row, 0)
        lat_row = QHBoxLayout()
        lat_row.setSpacing(4)
        self._lat_deg = QSpinBox()
        self._lat_deg.setRange(0, 90)
        self._lat_deg.setSuffix("°")
        self._lat_deg.setFixedWidth(60)
        self._lat_min = QSpinBox()
        self._lat_min.setRange(0, 59)
        self._lat_min.setSuffix("'")
        self._lat_min.setFixedWidth(58)
        self._lat_sec = QDoubleSpinBox()
        self._lat_sec.setRange(0.0, 59.99)
        self._lat_sec.setDecimals(2)
        self._lat_sec.setSuffix('"')
        self._lat_sec.setFixedWidth(72)
        self._lat_dir = QComboBox()
        self._lat_dir.addItems(['N', 'S'])
        self._lat_dir.setFixedWidth(46)
        for w in (self._lat_deg, self._lat_min, self._lat_sec, self._lat_dir):
            lat_row.addWidget(w)
        lat_row.addStretch()
        lat_container = QWidget()
        lat_container.setLayout(lat_row)
        grid.addWidget(lat_container, row, 1, 1, 4)
        row += 1

        # Longitude ── D° M' S" E/W
        grid.addWidget(QLabel("Longitude:"), row, 0)
        lon_row = QHBoxLayout()
        lon_row.setSpacing(4)
        self._lon_deg = QSpinBox()
        self._lon_deg.setRange(0, 180)
        self._lon_deg.setSuffix("°")
        self._lon_deg.setFixedWidth(68)
        self._lon_min = QSpinBox()
        self._lon_min.setRange(0, 59)
        self._lon_min.setSuffix("'")
        self._lon_min.setFixedWidth(58)
        self._lon_sec = QDoubleSpinBox()
        self._lon_sec.setRange(0.0, 59.99)
        self._lon_sec.setDecimals(2)
        self._lon_sec.setSuffix('"')
        self._lon_sec.setFixedWidth(72)
        self._lon_dir = QComboBox()
        self._lon_dir.addItems(['E', 'W'])
        self._lon_dir.setFixedWidth(46)
        for w in (self._lon_deg, self._lon_min, self._lon_sec, self._lon_dir):
            lon_row.addWidget(w)
        lon_row.addStretch()
        lon_container = QWidget()
        lon_container.setLayout(lon_row)
        grid.addWidget(lon_container, row, 1, 1, 4)
        row += 1

        # Time zone
        grid.addWidget(QLabel("Time Zone (UTC±):"), row, 0)
        self._tz_spin = QDoubleSpinBox()
        self._tz_spin.setRange(-14.0, 14.0)
        self._tz_spin.setSingleStep(0.5)
        self._tz_spin.setDecimals(2)
        self._tz_spin.setPrefix("UTC ")
        self._tz_spin.setFixedWidth(100)
        grid.addWidget(self._tz_spin, row, 1)
        grid.addWidget(QLabel("e.g. +5.5 for IST, -5.0 for EST"), row, 2, 1, 3)
        row += 1

        outer.addLayout(grid)
        outer.addSpacing(4)

        # OK / Cancel
        btns = QDialogButtonBox(
            QDialogButtonBox.StandardButton.Ok | QDialogButtonBox.StandardButton.Cancel)
        btns.accepted.connect(self._on_accept)
        btns.rejected.connect(self.reject)
        outer.addWidget(btns)

    # ── Pre-populate from a record dict ──────────────────────────
    def _populate(self, data: dict):
        if data.get('name'):
            self._name_edit.setText(str(data['name']))
        try:
            self._gender_combo.setCurrentIndex(int(data.get('gender', 0) or 0))
        except Exception:
            pass
        # DOB: stored internally as YYYY,MM,DD – show as yyyy-mm-dd
        dob = str(data.get('dob', '') or '').strip()
        if dob:
            self._dob_edit.setText(dob.replace(',', '-'))
        # TOB
        tob = str(data.get('tob', '') or '').strip()
        if tob:
            self._tob_edit.setText(tob)
        if data.get('place'):
            self._place_edit.setText(str(data['place']))
        # Latitude
        try:
            lat = float(data.get('latitude', 0) or 0)
            d, m, s, positive = self._decimal_to_dms(lat)
            self._lat_deg.setValue(d)
            self._lat_min.setValue(m)
            self._lat_sec.setValue(round(s, 2))
            self._lat_dir.setCurrentText('N' if positive else 'S')
        except Exception:
            pass
        # Longitude
        try:
            lon = float(data.get('longitude', 0) or 0)
            d, m, s, positive = self._decimal_to_dms(lon)
            self._lon_deg.setValue(d)
            self._lon_min.setValue(m)
            self._lon_sec.setValue(round(s, 2))
            self._lon_dir.setCurrentText('E' if positive else 'W')
        except Exception:
            pass
        # Timezone
        try:
            self._tz_spin.setValue(float(data.get('tz_offset', 0) or 0))
        except Exception:
            pass

    # ── Validation + accept ───────────────────────────────────────
    def _on_accept(self):
        from datetime import datetime as _dt
        dob = self._dob_edit.text().strip()
        if dob:
            try:
                _dt.strptime(dob, '%Y-%m-%d')
            except ValueError:
                QMessageBox.warning(self, "Invalid Date",
                                    "Date of Birth must be in yyyy-mm-dd format.\n"
                                    "Example: 1980-07-15")
                self._dob_edit.setFocus()
                return
        tob = self._tob_edit.text().strip()
        if tob:
            try:
                _dt.strptime(tob, '%H:%M:%S')
            except ValueError:
                QMessageBox.warning(self, "Invalid Time",
                                    "Time of Birth must be in hh:mm:ss format (24-hour).\n"
                                    "Example: 14:30:00")
                self._tob_edit.setFocus()
                return
        self.accept()

    # ── Result extraction ─────────────────────────────────────────
    def get_data(self) -> dict:
        """
        Return entered birth data as a dict with internal formats:
          dob       → "YYYY,MM,DD"  (comma-separated, as ChartTabbed expects)
          tob       → "HH:MM:SS"
          latitude  → float (signed decimal degrees, + North / - South)
          longitude → float (signed decimal degrees, + East  / - West)
          tz_offset → float
        """
        dob_raw = self._dob_edit.text().strip()
        dob_internal = dob_raw.replace('-', ',') if dob_raw else ''
        lat = self._dms_to_decimal(
            self._lat_deg.value(), self._lat_min.value(),
            self._lat_sec.value(), self._lat_dir.currentText())
        lon = self._dms_to_decimal(
            self._lon_deg.value(), self._lon_min.value(),
            self._lon_sec.value(), self._lon_dir.currentText())
        return {
            'name':      self._name_edit.text().strip(),
            'gender':    self._gender_combo.currentIndex(),
            'dob':       dob_internal,
            'tob':       self._tob_edit.text().strip(),
            'place':     self._place_edit.text().strip(),
            'latitude':  lat,
            'longitude': lon,
            'tz_offset': self._tz_spin.value(),
        }

    # ── DMS ↔ decimal helpers ─────────────────────────────────────
    @staticmethod
    def _dms_to_decimal(degrees: int, minutes: int, seconds: float,
                        direction: str) -> float:
        """Convert degrees/minutes/seconds + compass direction to signed decimal."""
        value = degrees + minutes / 60.0 + seconds / 3600.0
        if direction in ('S', 'W'):
            value = -value
        return round(value, 6)

    @staticmethod
    def _decimal_to_dms(decimal: float):
        """Convert signed decimal degrees to (degrees, minutes, seconds, is_positive)."""
        positive = decimal >= 0
        decimal = abs(decimal)
        degrees = int(decimal)
        remainder = (decimal - degrees) * 60.0
        minutes = int(remainder)
        seconds = (remainder - minutes) * 60.0
        return degrees, minutes, seconds, positive


# ──────────────────────────────────────────────────────────────────
#  Browse Charts dialog
# ──────────────────────────────────────────────────────────────────
class _BrowseChartsDialog(QDialog):
    """
    Search and select a chart from the SQLite database.

    Columns shown: Name | Gender | DOB | TOB | Place | Tags | Notes | Saved
    The user can:
      • Type a search term to filter by name / place / tags
      • Double-click (or select + Open) to load a chart
      • Delete a selected row from the database
    """
    _HEADERS = ["Name", "Gender", "Date of Birth", "Time", "Place",
                "Tags", "Notes", "Saved"]
    _COL_MAP = ["name", "gender", "dob", "tob", "place",
                "tags", "notes", "created_at"]

    def __init__(self, db: 'ChartDatabase', parent=None):
        super().__init__(parent)
        self._db = db
        self.selected_record: dict | None = None
        self.setWindowTitle("Browse Charts")
        self.resize(900, 480)
        self._build_ui()
        self._refresh("")

    def _build_ui(self):
        vlay = QVBoxLayout(self)

        # Search bar
        hlay = QHBoxLayout()
        self._search = QLineEdit(placeholderText="Search by name, place or tag…")
        self._search.textChanged.connect(self._refresh)
        btn_clear = QPushButton("Clear")
        btn_clear.clicked.connect(lambda: self._search.clear())
        hlay.addWidget(self._search)
        hlay.addWidget(btn_clear)
        vlay.addLayout(hlay)

        # Results table
        self._table = QTableWidget(0, len(self._HEADERS))
        self._table.setHorizontalHeaderLabels(self._HEADERS)
        self._table.setSelectionBehavior(QAbstractItemView.SelectionBehavior.SelectRows)
        self._table.setEditTriggers(QAbstractItemView.EditTrigger.NoEditTriggers)
        self._table.horizontalHeader().setSectionResizeMode(QHeaderView.ResizeMode.Stretch)
        self._table.horizontalHeader().setSectionResizeMode(
            0, QHeaderView.ResizeMode.ResizeToContents)
        self._table.doubleClicked.connect(self._accept_row)
        self._table.setAlternatingRowColors(True)
        vlay.addWidget(self._table)

        # Buttons
        btn_row = QHBoxLayout()
        btn_open   = QPushButton("Open")
        btn_delete = QPushButton("Delete")
        btn_cancel = QPushButton("Cancel")
        btn_open.clicked.connect(self._accept_row)
        btn_delete.clicked.connect(self._delete_row)
        btn_cancel.clicked.connect(self.reject)
        btn_row.addWidget(btn_open)
        btn_row.addWidget(btn_delete)
        btn_row.addStretch()
        btn_row.addWidget(btn_cancel)
        vlay.addLayout(btn_row)

    def _refresh(self, query: str = ""):
        self._records = self._db.search_charts(query)
        self._table.setRowCount(0)
        _gender_labels = {0: "Male", 1: "Female", 2: "Other"}
        for rec in self._records:
            row = self._table.rowCount()
            self._table.insertRow(row)
            for col, key in enumerate(self._COL_MAP):
                val = rec.get(key, "")
                if key == "gender":
                    val = _gender_labels.get(int(val or 0), str(val))
                elif key == "created_at" and val:
                    val = str(val)[:16]        # trim seconds
                item = QTableWidgetItem(str(val))
                item.setData(Qt.ItemDataRole.UserRole, rec.get("id"))
                self._table.setItem(row, col, item)

    def _selected_record(self) -> dict | None:
        rows = self._table.selectedItems()
        if not rows:
            return None
        row_idx = self._table.currentRow()
        if 0 <= row_idx < len(self._records):
            return self._records[row_idx]
        return None

    def _accept_row(self):
        rec = self._selected_record()
        if rec is None:
            QMessageBox.information(self, "Browse Charts", "Please select a chart first.")
            return
        self.selected_record = rec
        self.accept()

    def _delete_row(self):
        rec = self._selected_record()
        if rec is None:
            return
        reply = QMessageBox.question(
            self, "Delete Chart",
            f"Delete \"{rec.get('name','')}\" ({rec.get('dob','')}) from the database?",
            QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No,
            QMessageBox.StandardButton.No,
        )
        if reply == QMessageBox.StandardButton.Yes:
            self._db.delete_chart(rec["id"])
            self._refresh(self._search.text())


# ──────────────────────────────────────────────────────────────────
#  Main window
# ──────────────────────────────────────────────────────────────────
class JHoraMainWindow(QMainWindow):
    """
    QMainWindow shell that wraps ChartTabbed and provides a
    Jagannath Hora 8-style menu bar, toolbar and status bar.
    """
    def __init__(self, chart_type: str = 'south_indian',
                 language: str = 'English',
                 date_of_birth=None, time_of_birth=None,
                 place_of_birth=None, gender: int = 0,
                 show_marriage_compatibility: bool = True,
                 calculation_type: str = 'drik'):
        super().__init__()
        self._app_title = f"HoneyBee{_APP_VERSION}  –  Vedic Astrology"
        self.setWindowTitle(self._app_title)
        self.setWindowIcon(QtGui.QIcon(const._IMAGE_ICON_PATH))

        # ── Central widget ────────────────────────────────────────
        self._chart = ChartTabbed(
            chart_type=chart_type,
            show_marriage_compatibility=show_marriage_compatibility,
            calculation_type=calculation_type,
            language=language,
            date_of_birth=date_of_birth,
            time_of_birth=time_of_birth,
            place_of_birth=place_of_birth,
            gender=gender,
        )
        # ChartTabbed._init_main_window() calls setFixedSize() on itself, which
        # would prevent the QMainWindow from resizing.  Remove that constraint.
        from PyQt6.QtWidgets import QSizePolicy
        self._chart.setMinimumSize(0, 0)
        self._chart.setMaximumSize(16_777_215, 16_777_215)  # QWIDGETSIZE_MAX
        self._chart.setSizePolicy(
            QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Expanding)
        self.setCentralWidget(self._chart)

        # ── UI chrome ─────────────────────────────────────────────
        self._build_menu_bar()
        self._build_toolbar()
        self._build_status_bar()

        # Update status every 30 s
        self._status_timer = QTimer(self)
        self._status_timer.timeout.connect(self._refresh_status)
        self._status_timer.start(30_000)
        self._refresh_status()

        self.showMaximized()
        self._db = ChartDatabase()          # SQLite chart store
        self._current_chart_id: int | None = None   # DB id of loaded chart

    # ── Public API (pass-through to ChartTabbed) ─────────────────
    def name(self, name: str):               self._chart.name(name)
    def gender(self, g: int):                self._chart.gender(g)
    def place(self, *a, **kw):               self._chart.place(*a, **kw)
    def date_of_birth(self, dob: str):       self._chart.date_of_birth(dob)
    def time_of_birth(self, tob: str):       self._chart.time_of_birth(tob)
    def language(self, lang: str):           self._chart.language(lang)
    def ayanamsa_mode(self, mode, val=None): self._chart.ayanamsa_mode(mode, val)
    def chart_type(self, ct: str):           self._chart.chart_type(ct)
    def compute_horoscope(self, **kw):       self._chart.compute_horoscope(**kw)

    # ─────────────────────────────────────────────────────────────
    #  Menu bar
    # ─────────────────────────────────────────────────────────────
    def _build_menu_bar(self):
        mb = self.menuBar()

        # ── File ──────────────────────────────────────────────────
        file_menu = mb.addMenu("&File")
        self._act_new     = self._action("&New Chart",          "Ctrl+N",  "Start a new horoscope",              self._new_chart)
        self._act_browse  = self._action("&Browse Charts…",     "Ctrl+B",  "Browse/search the chart database",   self._browse_charts)
        self._act_open    = self._action("&Import JHD file…",   "Ctrl+O",  "Import a JHD/txt chart file",        self._import_jhd)
        self._act_save    = self._action("&Save to Database",   "Ctrl+S",  "Save current chart to database",     self._save_chart)
        self._act_export  = self._action("&Export JHD file…",   "Ctrl+E",  "Export current chart as JHD file",   self._export_jhd)
        self._act_pdf     = self._action("Save as &PDF…",       "Ctrl+P",  "Export horoscope as PDF",            self._save_pdf)
        self._act_exit    = self._action("E&xit",               "Alt+F4",  "Quit PyJHora",                       self._exit_app)
        for act in [self._act_new, self._act_browse, None,
                    self._act_save, self._act_open, self._act_export, None,
                    self._act_pdf, None, self._act_exit]:
            if act is None:
                file_menu.addSeparator()
            else:
                file_menu.addAction(act)

        # ── Edit ──────────────────────────────────────────────────
        edit_menu = mb.addMenu("&Edit")
        self._act_compute = self._action("&Compute / Refresh", "F5",
                                         "Recalculate chart with current inputs",
                                         lambda: self._chart.compute_horoscope())
        self._act_city    = self._action("Save &City to DB",  "",
                                         "Save current city to the world-cities database",
                                         self._save_city)
        for act in [self._act_compute, None, self._act_city]:
            if act is None:
                edit_menu.addSeparator()
            else:
                edit_menu.addAction(act)

        # ── Charts ────────────────────────────────────────────────
        charts_menu = mb.addMenu("&Charts")
        _chart_styles = [
            ("&South Indian",  "south_indian"),
            ("&North Indian",  "north_indian"),
            ("&East Indian",   "east_indian"),
            ("&Western Chart", "western"),
            ("Sudarsana &Chakra", "sudarsana_chakra"),
        ]
        for label, ct in _chart_styles:
            act = self._action(label, "", f"Switch to {label} chart style",
                               lambda checked=False, c=ct: self._set_chart_type(c))
            charts_menu.addAction(act)
        charts_menu.addSeparator()
        # Divisional chart quick-selectors
        _div_charts = [
            ("D-1  Rasi",          0),   ("D-2  Hora",         1),
            ("D-3  Drekkana",      2),   ("D-9  Navamsa",      8),
            ("D-10 Dashamsa",      9),   ("D-12 Dwadashamsa",  11),
            ("D-16 Shodashamsa",   12),  ("D-20 Vimshamsa",    13),
            ("D-24 Chaturvimshamsa",14), ("D-27 Nakshatramsa", 15),
            ("D-30 Trimshamsa",    16),  ("D-40 Khavedamsa",   17),
            ("D-45 Akshavedamsa",  18),  ("D-60 Shastiamsam",  19),
        ]
        for label, idx in _div_charts:
            act = self._action(label, "",
                               f"Show {label}",
                               lambda checked=False, i=idx: self._chart._kundali_chart_combo.setCurrentIndex(i)
                               if hasattr(self._chart, '_kundali_chart_combo') else None)
            charts_menu.addAction(act)

        # ── Dhasa ─────────────────────────────────────────────────
        dhasa_menu = mb.addMenu("&Dhasa")
        _dhasa_tab_idx = None
        from jhora.ui.horo_chart_tabs import _dhasa_bhukthi_tab_index as _dbi
        _dhasa_tab_idx = _dbi
        _graha_dhasas = [
            "Vimsottari", "Yoga-Vimsottari", "Rasi-Bhukthi-Vimsottari",
            "Ashtottari", "Tithi-Ashtottari", "Yogini", "Tithi-Yogini",
            "Shodasottari", "Dwadasottari", "Dwisatpathi",
            "Panchottari", "Satabdika", "Chaturaaseeti-Sama",
            "Shashtisama", "Shattrimsa-Sama", "Naisargika",
            "Tara", "Karaka", "Buddhi-Gathi", "Kaala", "Aayu",
        ]
        _rasi_dhasas = [
            "Narayana", "Kendraadhi-Rasi", "Sudasa", "Drig", "Nirayana",
            "Shoola", "Kendraadhi-Karaka", "Chara", "Lagnamsaka",
            "Padhanadhamsa", "Mandooka", "Sthira", "Tara-Lagna",
            "Brahma", "Varnada", "Yogardha", "Navamsa", "Paryaaya",
            "Trikona", "Kalachakra", "Chakra", "Sandhya-Panchaka",
        ]
        graha_sub = dhasa_menu.addMenu("Graha Dhasas")
        for d in _graha_dhasas:
            act = self._action(d, "", f"Show {d} Dhasa-Bhukthi",
                               lambda checked=False, t=_dhasa_tab_idx:
                                   self._chart.tabWidget.setCurrentIndex(t)
                                   if hasattr(self._chart, 'tabWidget') else None)
            graha_sub.addAction(act)
        rasi_sub = dhasa_menu.addMenu("Rasi Dhasas")
        for d in _rasi_dhasas:
            act = self._action(d, "", f"Show {d} Dhasa-Bhukthi",
                               lambda checked=False, t=_dhasa_tab_idx:
                                   self._chart.tabWidget.setCurrentIndex(t)
                                   if hasattr(self._chart, 'tabWidget') else None)
            rasi_sub.addAction(act)

        # ── Balas ─────────────────────────────────────────────────
        balas_menu = mb.addMenu("&Balas")
        _bala_items = [
            ("Shad Bala",          "shad_bala_str"),
            ("Bhava Bala",         "bhava_bala_str"),
            ("Vimsopaka Bala",     "vimsopaka_bala_str"),
            ("Vaiseshikamsa Bala", "vaiseshikamsa_bala_str"),
            ("Harsha/Pancha/Dwadhasa Bala","harsha_pancha_dwadhasa_vargeeya_bala_str"),
            ("Amsa Ruler",         "amsa_ruler_str"),
        ]
        from jhora.ui.horo_chart_tabs import (
            _shad_bala_tab_start, _bhava_bala_tab_start,
            _vimsopaka_bala_tab_start, _vaiseshikamsa_bala_tab_start,
            _other_bala_tab_start, _amsa_ruler_tab_start,
        )
        _bala_tab_indices = [
            _shad_bala_tab_start, _bhava_bala_tab_start,
            _vimsopaka_bala_tab_start, _vaiseshikamsa_bala_tab_start,
            _other_bala_tab_start, _amsa_ruler_tab_start,
        ]
        for (label, _), tidx in zip(_bala_items, _bala_tab_indices):
            act = self._action(label, "", f"Show {label}",
                               lambda checked=False, t=tidx:
                                   self._chart.tabWidget.setCurrentIndex(t)
                                   if hasattr(self._chart, 'tabWidget') else None)
            balas_menu.addAction(act)
        balas_menu.addSeparator()
        from jhora.ui.horo_chart_tabs import _ashtaka_varga_tab_start, _argala_tab_start, _shodhaya_tab_start
        _misc_bala = [
            ("Ashtaka Varga",  _ashtaka_varga_tab_start),
            ("Argala",         _argala_tab_start),
            ("Shodhaya Pinda", _shodhaya_tab_start),
        ]
        for label, tidx in _misc_bala:
            act = self._action(label, "", f"Show {label}",
                               lambda checked=False, t=tidx:
                                   self._chart.tabWidget.setCurrentIndex(t)
                                   if hasattr(self._chart, 'tabWidget') else None)
            balas_menu.addAction(act)

        # ── Options ───────────────────────────────────────────────
        opt_menu = mb.addMenu("&Options")
        # Language sub-menu
        lang_sub = opt_menu.addMenu("&Language")
        for lang in available_languages.keys():
            act = self._action(lang, "", f"Switch language to {lang}",
                               lambda checked=False, l=lang: self._chart.language(l))
            lang_sub.addAction(act)
        opt_menu.addSeparator()
        # Ayanamsa sub-menu
        ayan_sub = opt_menu.addMenu("&Ayanamsa")
        _available_ayanamsa = [k for k in list(const.available_ayanamsa_modes.keys())
                                if k not in ['SENTHIL', 'SIDM_USER', 'SUNDAR_SS']]
        for amode in _available_ayanamsa:
            act = self._action(amode, "", f"Set ayanamsa to {amode}",
                               lambda checked=False, a=amode: self._chart.ayanamsa_mode(a))
            ayan_sub.addAction(act)
        opt_menu.addSeparator()
        self._act_options = self._action("Preferences…", "Ctrl+,",
                                         "Open options/preferences dialog",
                                         self._show_preferences)
        opt_menu.addAction(self._act_options)

        # ── Tools ─────────────────────────────────────────────────
        tools_menu = mb.addMenu("&Tools")
        from jhora.ui.horo_chart_tabs import (
            _tabcount_before_chart_tab, _yoga_tab_start,
            _dosha_tab_start, _prediction_tab_start,
            _compatibility_tab_start, _kpinfo_tab_start,
            _chakra_tab_start,
        )
        _tool_tabs = [
            ("&Panchanga",           0),
            ("&Bhava Chart",         1),
            ("Pancha Pakshi Sastra", 2),
            ("Kundali Chart",        _tabcount_before_chart_tab),
            ("KP Star Lord Info",    _kpinfo_tab_start),
            ("Chakra",               _chakra_tab_start),
            ("&Yogas",               _yoga_tab_start),
            ("&Doshas",              _dosha_tab_start),
            ("&Predictions",         _prediction_tab_start),
            ("&Compatibility",       _compatibility_tab_start),
        ]
        for label, tidx in _tool_tabs:
            act = self._action(label, "", f"Go to {label} tab",
                               lambda checked=False, t=tidx:
                                   self._chart.tabWidget.setCurrentIndex(t)
                                   if hasattr(self._chart, 'tabWidget') else None)
            tools_menu.addAction(act)
        tools_menu.addSeparator()
        self._act_panchanga_window = self._action("Panchanga &Window…", "Ctrl+W",
                                                  "Open full Panchanga window",
                                                  self._open_panchanga_window)
        tools_menu.addAction(self._act_panchanga_window)

        # ── Help ──────────────────────────────────────────────────
        help_menu = mb.addMenu("&Help")
        self._act_readme   = self._action("&ReadMe / Documentation", "F1",
                                          "Open the ReadMe documentation",
                                          self._show_readme)
        self._act_about    = self._action("&About PyJHora…", "",
                                          "Show version and credits",
                                          self._show_about)
        for act in [self._act_readme, None, self._act_about]:
            if act is None:
                help_menu.addSeparator()
            else:
                help_menu.addAction(act)

    # ─────────────────────────────────────────────────────────────
    #  Toolbar
    # ─────────────────────────────────────────────────────────────
    def _build_toolbar(self):
        tb = QToolBar("Main Toolbar", self)
        tb.setMovable(False)
        tb.setToolButtonStyle(Qt.ToolButtonStyle.ToolButtonTextUnderIcon)
        tb.setIconSize(QtCore.QSize(22, 22))
        self.addToolBar(tb)

        def _tb_with_fallback(icon_name, text):
            """Return a QIcon using a standard theme icon with text fallback."""
            return QIcon.fromTheme(icon_name)

        _tb_items = [
            ("document-new",      "New",     "New Chart",             self._new_chart),
            ("system-search",     "Browse",  "Browse chart database", self._browse_charts),
            ("document-open",     "Import",  "Import JHD/txt file",   self._import_jhd),
            ("document-save",     "Save",    "Save to database",      self._save_chart),
            ("document-export",   "Export",  "Export JHD file",       self._export_jhd),
            ("document-print",    "PDF",     "Export to PDF",         self._save_pdf),
            (None, None, None, None),  # separator
            ("view-refresh",      "Compute", "Compute horoscope",
             lambda: self._chart.compute_horoscope()),
            (None, None, None, None),
            ("go-home",           "Rasi",    "Show Rasi chart",
             lambda: self._chart.tabWidget.setCurrentIndex(3)
             if hasattr(self._chart, 'tabWidget') else None),
        ]
        for icon_name, text, tip, slot in _tb_items:
            if icon_name is None:
                tb.addSeparator()
                continue
            act = QAction(_tb_with_fallback(icon_name, text), text, self)
            act.setStatusTip(tip)
            if slot:
                act.triggered.connect(slot)
            tb.addAction(act)

    # ─────────────────────────────────────────────────────────────
    #  Status bar
    # ─────────────────────────────────────────────────────────────
    def _build_status_bar(self):
        sb = QStatusBar(self)
        self.setStatusBar(sb)

        self._status_coords = QLabel("Lat: –  Lon: –  TZ: –")
        self._status_coords.setMinimumWidth(220)
        self._status_ayanamsa = QLabel(f"Ayanamsa: {const._DEFAULT_AYANAMSA_MODE}")
        self._status_ayanamsa.setMinimumWidth(180)
        self._status_datetime = QLabel("")
        self._status_datetime.setMinimumWidth(170)
        self._status_ready = QLabel("Ready")

        sb.addWidget(self._status_coords)
        sb.addWidget(self._status_ayanamsa)
        sb.addWidget(self._status_datetime)
        sb.addPermanentWidget(self._status_ready)

    def _refresh_status(self):
        try:
            lat  = self._chart._lat_text.text()  if hasattr(self._chart, '_lat_text')  else "–"
            lon  = self._chart._long_text.text() if hasattr(self._chart, '_long_text') else "–"
            tz   = self._chart._tz_text.text()   if hasattr(self._chart, '_tz_text')   else "–"
            amod = const._DEFAULT_AYANAMSA_MODE
            now  = QDateTime.currentDateTime().toString("ddd dd-MMM-yyyy  hh:mm")
            self._status_coords.setText(f"Lat: {lat}  Lon: {lon}  TZ: {tz}")
            self._status_ayanamsa.setText(f"Ayanamsa: {amod}")
            self._status_datetime.setText(now)
        except Exception:
            pass

    # ─────────────────────────────────────────────────────────────
    #  Action helper
    # ─────────────────────────────────────────────────────────────
    @staticmethod
    def _action(text, shortcut, tip, slot):
        act = QAction(text)
        if shortcut:
            act.setShortcut(QKeySequence(shortcut))
        act.setStatusTip(tip)
        act.triggered.connect(slot)
        return act

    # ─────────────────────────────────────────────────────────────
    #  Menu slots
    # ─────────────────────────────────────────────────────────────
    def _new_chart(self):
        """Open the Birth Data dialog to enter details for a new chart."""
        from datetime import datetime as _dt
        now = _dt.now()
        initial = {
            'name':      '',
            'gender':    0,
            'dob':       now.strftime('%Y,%m,%d'),
            'tob':       now.strftime('%H:%M:%S'),
            'place':     '',
            'latitude':  0.0,
            'longitude': 0.0,
            'tz_offset': 0.0,
        }
        dlg = BirthDataDialog(self, initial_data=initial)
        if dlg.exec() != QDialog.DialogCode.Accepted:
            return
        data = dlg.get_data()
        self._current_chart_id = None
        self._load_record_into_ui(data)
        self._refresh_status()
        self.statusBar().showMessage(
            "New chart ready – click Compute (F5) to calculate.", 4000)

    # ── Chart database helpers ────────────────────────────────────
    def _load_record_into_ui(self, record: dict):
        """Push a DB record's fields into the ChartTabbed UI."""
        if record.get('name'):  self._chart.name(record['name'])
        if record.get('dob'):   self._chart.date_of_birth(record['dob'])
        if record.get('tob'):   self._chart.time_of_birth(record['tob'])
        if all(record.get(k) is not None for k in ('place','latitude','longitude','tz_offset')):
            self._chart.place(record['place'],
                              float(record['latitude']),
                              float(record['longitude']),
                              float(record['tz_offset']))
        if record.get('gender') is not None:
            self._chart.gender(int(record['gender']))
        self._current_chart_id = record.get('id')

    def _collect_chart_data(self) -> dict:
        """Read current UI fields into a dict ready for ChartDatabase.save_chart()."""
        data = {
            'name':      self._chart._name_text.text()   if hasattr(self._chart, '_name_text')   else '',
            'dob':       self._chart._dob_text.text()    if hasattr(self._chart, '_dob_text')    else '',
            'tob':       self._chart._tob_text.text()    if hasattr(self._chart, '_tob_text')    else '',
            'place':     self._chart._place_text.text()  if hasattr(self._chart, '_place_text')  else '',
            'latitude':  float(self._chart._lat_text.text()  or 0) if hasattr(self._chart, '_lat_text')  else 0.0,
            'longitude': float(self._chart._long_text.text() or 0) if hasattr(self._chart, '_long_text') else 0.0,
            'tz_offset': float(self._chart._tz_text.text()   or 0) if hasattr(self._chart, '_tz_text')   else 0.0,
            'gender':    self._chart._gender_combo.currentIndex() if hasattr(self._chart, '_gender_combo') else 0,
        }
        if self._current_chart_id:
            data['id'] = self._current_chart_id
        return data

    # ── Browse dialog ─────────────────────────────────────────────
    def _browse_charts(self):
        """Open the Browse Charts dialog then the Birth Data editor."""
        browse_dlg = _BrowseChartsDialog(self._db, self)
        if not (browse_dlg.exec() and browse_dlg.selected_record):
            return
        rec = browse_dlg.selected_record
        # Pre-populate the birth data dialog with the selected record
        birth_dlg = BirthDataDialog(self, initial_data=rec)
        if birth_dlg.exec() != QDialog.DialogCode.Accepted:
            return
        data = birth_dlg.get_data()
        # Preserve the database id so Save overwrites the same record
        if rec.get('id') is not None:
            data['id'] = rec['id']
        self._load_record_into_ui(data)
        self._chart.compute_horoscope()
        self._refresh_status()
        self.statusBar().showMessage(
            f"Loaded: {data.get('name','')}  ({data.get('dob','')})", 4000)

    # ── Save to DB ────────────────────────────────────────────────
    def _save_chart(self):
        """Save current chart fields to the SQLite database."""
        try:
            data = self._collect_chart_data()
            if not data.get('name') or not data.get('dob'):
                QMessageBox.warning(self, "Save Chart",
                                    "Please enter at least a name and date of birth before saving.")
                return
            # Optionally prompt for notes/tags
            notes, ok1 = QInputDialog.getMultiLineText(
                self, "Notes", "Add notes for this chart (optional):",
                self._db.get_chart(self._current_chart_id).get('notes', '')
                if self._current_chart_id else '')
            if ok1:
                data['notes'] = notes
            tags, ok2 = QInputDialog.getText(
                self, "Tags", "Tags (comma-separated, optional):",
                text=self._db.get_chart(self._current_chart_id).get('tags', '')
                if self._current_chart_id else '')
            if ok2:
                data['tags'] = tags
            chart_id = self._db.save_chart(data)
            self._current_chart_id = chart_id
            self.statusBar().showMessage(
                f"Saved to database  (id={chart_id}  –  {self._db.count()} charts total)", 4000)
        except Exception as e:
            QMessageBox.critical(self, "Save Chart", f"Error saving chart:\n{e}")

    # ── Import JHD file ───────────────────────────────────────────
    def _import_jhd(self):
        fpath, _ = QFileDialog.getOpenFileName(
            self, "Import Chart File", "",
            "JHD / Text Files (*.jhd *.txt);;All Files (*)")
        if not fpath:
            return
        try:
            chart_id = self._db.import_jhd(fpath)
            rec = self._db.get_chart(chart_id)
            self._load_record_into_ui(rec)
            self._chart.compute_horoscope()
            self._refresh_status()
            self.statusBar().showMessage(f"Imported: {fpath}  →  db id={chart_id}", 4000)
        except Exception as e:
            QMessageBox.critical(self, "Import Chart", f"Error importing file:\n{e}")

    # ── Export JHD file ───────────────────────────────────────────
    def _export_jhd(self):
        if not self._current_chart_id:
            # Auto-save first so we have a valid id
            self._save_chart()
        if not self._current_chart_id:
            return
        fpath, _ = QFileDialog.getSaveFileName(
            self, "Export Chart File", "",
            "JHD Files (*.jhd);;Text Files (*.txt);;All Files (*)")
        if not fpath:
            return
        try:
            ok = self._db.export_jhd(self._current_chart_id, fpath)
            if ok:
                self.statusBar().showMessage(f"Exported: {fpath}", 3000)
            else:
                QMessageBox.warning(self, "Export", "Nothing to export – save the chart first.")
        except Exception as e:
            QMessageBox.critical(self, "Export Chart", f"Error exporting file:\n{e}")

    # _save_chart, _import_jhd, _export_jhd defined above near _browse_charts

    def _save_pdf(self):
        try:
            self._chart.save_as_pdf(pdf_file_name=None)
        except Exception as e:
            QMessageBox.critical(self, "Save as PDF", f"Error:\n{e}")

    def _save_city(self):
        try:
            self._chart._save_city_to_database()
        except Exception as e:
            QMessageBox.critical(self, "Save City", f"Error:\n{e}")

    def _set_chart_type(self, ct: str):
        self._chart.chart_type(ct)
        self.statusBar().showMessage(f"Chart type set to: {ct}", 2000)

    def _show_preferences(self):
        try:
            from jhora.ui.options_dialog import OptionDialog
            dlg = OptionDialog(self)
            dlg.exec()
        except Exception:
            QMessageBox.information(self, "Preferences",
                                    "Preferences can be changed via the option buttons "
                                    "inside the chart tabs (Ayanamsa, Chart Type, Language).")

    def _open_panchanga_window(self):
        try:
            from jhora.ui.panchangam import PanchangaWidget
            self._panchanga_win = PanchangaWidget()
            self._panchanga_win.show()
        except Exception as e:
            QMessageBox.warning(self, "Panchanga Window", f"Could not open Panchanga window:\n{e}")

    def _show_readme(self):
        readme_path = os.path.join(os.path.dirname(os.path.dirname(
            os.path.abspath(__file__))), 'README.md')
        if os.path.exists(readme_path):
            with open(readme_path, 'r', encoding='utf-8') as f:
                txt = f.read()
            dlg = QDialog(self)
            dlg.setWindowTitle("PyJHora – Documentation")
            dlg.resize(700, 550)
            lay = QVBoxLayout(dlg)
            te = QTextEdit(readOnly=True)
            te.setPlainText(txt)
            lay.addWidget(te)
            bb = QDialogButtonBox(QDialogButtonBox.StandardButton.Ok)
            bb.accepted.connect(dlg.accept)
            lay.addWidget(bb)
            dlg.exec()
        else:
            QMessageBox.information(self, "Documentation",
                                    "README.md not found.\n"
                                    "Visit https://github.com/naturalstupid/PyJHora")

    def _show_about(self):
        _AboutDialog(self).exec()

    def _exit_app(self):
        QApplication.quit()

    # closeEvent – confirm before exit
    def closeEvent(self, event):
        reply = QMessageBox.question(
            self, "Exit PyJHora",
            "Are you sure you want to exit?",
            QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No,
            QMessageBox.StandardButton.No,
        )
        if reply == QMessageBox.StandardButton.Yes:
            event.accept()
        else:
            event.ignore()


# ──────────────────────────────────────────────────────────────────
#  Application entry point
# ──────────────────────────────────────────────────────────────────
def _apply_jhora_style(app: QApplication):
    """Apply the Jagannath Hora 8-style palette and stylesheet."""
    app.setStyle("Fusion")          # Crisp cross-platform base
    app.setStyleSheet(_JHORA_STYLESHEET)
    # Override palette for classic Windows feel
    pal = app.palette()
    pal.setColor(pal.ColorRole.Window,          QColor("#F0F0F0"))
    pal.setColor(pal.ColorRole.WindowText,      QColor("#000000"))
    pal.setColor(pal.ColorRole.Base,            QColor("#FFFFFF"))
    pal.setColor(pal.ColorRole.AlternateBase,   QColor("#F5F5E8"))
    pal.setColor(pal.ColorRole.ToolTipBase,     QColor("#FFFFE1"))
    pal.setColor(pal.ColorRole.ToolTipText,     QColor("#000000"))
    pal.setColor(pal.ColorRole.Text,            QColor("#000000"))
    pal.setColor(pal.ColorRole.Button,          QColor("#D4D0C8"))
    pal.setColor(pal.ColorRole.ButtonText,      QColor("#000000"))
    pal.setColor(pal.ColorRole.BrightText,      QColor("#FF0000"))
    pal.setColor(pal.ColorRole.Link,            QColor("#0000CC"))
    pal.setColor(pal.ColorRole.Highlight,       QColor("#316AC5"))
    pal.setColor(pal.ColorRole.HighlightedText, QColor("#FFFFFF"))
    app.setPalette(pal)
    # Application-wide font (matches JHora 8's Arial 9pt)
    app.setFont(QFont("Arial", 9))


def main():
    """Launch PyJHora with the JHora 8-style main window."""
    def except_hook(cls, exception, traceback):
        sys.__excepthook__(cls, exception, traceback)
    sys.excepthook = except_hook

    App = QApplication(sys.argv)
    _apply_jhora_style(App)

    win = JHoraMainWindow(chart_type='south_indian', language='English')

    # ── Sample data – remove or change for production use ──
    win.name('Sample Chart')
    win.gender(1)
    win.date_of_birth('1996,12,7')
    win.time_of_birth('10:34:00')
    win.place('Chennai, India', 13.0878, 80.2785, 5.5)
    win.compute_horoscope()
    # ─────────────────────────────────────────────────────────

    sys.exit(App.exec())


if __name__ == "__main__":
    main()
