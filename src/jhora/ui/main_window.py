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
    QDialogButtonBox, QTextEdit, QInputDialog
)
from PyQt6.QtGui import QAction, QIcon, QKeySequence, QFont, QColor, QPixmap
from PyQt6.QtCore import Qt, QTimer, QDateTime, pyqtSignal

from jhora import const, utils
from jhora._package_info import version as _APP_VERSION
from jhora.ui.horo_chart_tabs import ChartTabbed, available_chart_types, available_languages

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
        self._app_title = f"PyJHora  v{_APP_VERSION}  –  Vedic Astrology"
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
        self._act_new     = self._action("&New Chart",       "Ctrl+N", "Start a new horoscope",          self._new_chart)
        self._act_open    = self._action("&Open…",           "Ctrl+O", "Load chart data from file",      self._open_chart)
        self._act_save    = self._action("&Save…",           "Ctrl+S", "Save chart data to file",        self._save_chart)
        self._act_pdf     = self._action("Save as &PDF…",   "Ctrl+P", "Export horoscope as PDF",        self._save_pdf)
        self._act_exit    = self._action("E&xit",            "Alt+F4", "Quit PyJHora",                   self._exit_app)
        for act in [self._act_new, self._act_open, self._act_save, None,
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
            ("document-new",      "New",     "New Chart",          self._new_chart),
            ("document-open",     "Open",    "Open chart file",    self._open_chart),
            ("document-save",     "Save",    "Save chart data",    self._save_chart),
            ("document-print",    "PDF",     "Export to PDF",      self._save_pdf),
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
        """Reset inputs for a new chart."""
        try:
            from _datetime import datetime
            now = datetime.now()
            self._chart.date_of_birth(now.strftime('%Y,%m,%d'))
            self._chart.time_of_birth(now.strftime('%H:%M:%S'))
            self._chart._name_text.setText("New Chart")
            self._chart._place_text.clear()
            self._chart._lat_text.clear()
            self._chart._long_text.clear()
            self._chart._tz_text.clear()
            self._refresh_status()
            self.statusBar().showMessage("New chart started – enter birth details and click Compute.", 4000)
        except Exception as e:
            QMessageBox.warning(self, "New Chart", str(e))

    def _open_chart(self):
        fpath, _ = QFileDialog.getOpenFileName(
            self, "Open Chart Data", "", "Text Files (*.txt);;All Files (*)")
        if not fpath:
            return
        try:
            with open(fpath, 'r', encoding='utf-8') as f:
                lines = [l.strip() for l in f.readlines()]
            data = {}
            for line in lines:
                if '=' in line:
                    k, v = line.split('=', 1)
                    data[k.strip().lower()] = v.strip()
            if 'name'  in data: self._chart.name(data['name'])
            if 'dob'   in data: self._chart.date_of_birth(data['dob'])
            if 'tob'   in data: self._chart.time_of_birth(data['tob'])
            if 'place' in data and 'lat' in data and 'lon' in data and 'tz' in data:
                self._chart.place(data['place'], float(data['lat']),
                                  float(data['lon']), float(data['tz']))
            if 'gender' in data:
                self._chart.gender(int(data.get('gender', 0)))
            self._chart.compute_horoscope()
            self._refresh_status()
            self.statusBar().showMessage(f"Loaded: {fpath}", 3000)
        except Exception as e:
            QMessageBox.critical(self, "Open Chart", f"Error opening file:\n{e}")

    def _save_chart(self):
        fpath, _ = QFileDialog.getSaveFileName(
            self, "Save Chart Data", "", "Text Files (*.txt);;All Files (*)")
        if not fpath:
            return
        try:
            name     = self._chart._name_text.text()    if hasattr(self._chart, '_name_text')   else ''
            dob      = self._chart._dob_text.text()     if hasattr(self._chart, '_dob_text')    else ''
            tob      = self._chart._tob_text.text()     if hasattr(self._chart, '_tob_text')    else ''
            place    = self._chart._place_text.text()   if hasattr(self._chart, '_place_text')  else ''
            lat      = self._chart._lat_text.text()     if hasattr(self._chart, '_lat_text')    else ''
            lon      = self._chart._long_text.text()    if hasattr(self._chart, '_long_text')   else ''
            tz       = self._chart._tz_text.text()      if hasattr(self._chart, '_tz_text')     else ''
            gender   = str(self._chart._gender_combo.currentIndex()) \
                       if hasattr(self._chart, '_gender_combo') else '0'
            content  = (f"name={name}\ndob={dob}\ntob={tob}\n"
                        f"place={place}\nlat={lat}\nlon={lon}\ntz={tz}\ngender={gender}\n")
            with open(fpath, 'w', encoding='utf-8') as f:
                f.write(content)
            self.statusBar().showMessage(f"Saved: {fpath}", 3000)
        except Exception as e:
            QMessageBox.critical(self, "Save Chart", f"Error saving file:\n{e}")

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
