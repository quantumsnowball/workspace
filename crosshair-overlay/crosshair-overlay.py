#!/usr/bin/env -S uv run

# /// script
# dependencies = [
#   "PyGObject",
#   "pycairo",
# ]
# ///

# For GTK4 Layer Shell to get linked before libwayland-client we must explicitly load it before importing with gi
# ref: https://github.com/wmww/gtk4-layer-shell/blob/main/examples/simple-example.py
from ctypes import CDLL

import cairo
import gi

# pre-loading
CDLL("libgtk4-layer-shell.so")
# pre-checking
gi.require_version("Gtk", "4.0")
gi.require_version("Gdk", "4.0")
gi.require_version("Gtk4LayerShell", "1.0")

# MUST load after CDLL("libgtk4-layer-shell.so") pre-loading
# should load after gi.require_version pre-checking
from gi.repository import Gdk, Gtk  # noqa
from gi.repository import Gtk4LayerShell as LayerShell  # noqa


def on_activate(app: Gtk.Application) -> None:
    win = Gtk.ApplicationWindow(application=app)

    # Initialize Layer Shell for this window
    LayerShell.init_for_window(win)

    # Set the Namespace (Crucial for niri config matching)
    LayerShell.set_namespace(win, "crosshair-overlay")

    # Set the Layer to OVERLAY
    LayerShell.set_layer(win, LayerShell.Layer.OVERLAY)

    # Make it click-through (no keyboard/mouse focus)
    LayerShell.set_keyboard_mode(win, LayerShell.KeyboardMode.NONE)

    # Visuals: Transparent background
    css_provider = Gtk.CssProvider()
    css_provider.load_from_data(b"window { background: none; }")
    if (display := Gdk.Display.get_default()) is not None:
        Gtk.StyleContext.add_provider_for_display(display, css_provider, Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION)

    # Draw the pixels
    def draw_func(
        area: Gtk.DrawingArea,
        cr: cairo.Context,
        width: float,
        height: float
    ) -> None:
        # calibrate the center using https://centerofmyscreen.com/
        cr.arc(width/2, height/2 - 14, 2, 0, 2 * 3.14159)
        cr.set_source_rgba(0, 1.0, 0, 1.0)  # Green
        cr.fill()
    draw_area = Gtk.DrawingArea()
    draw_area.set_draw_func(draw_func)
    win.set_child(draw_area)

    # Size & Position
    # Layer shell centers by default if no anchors are set
    win.set_default_size(4, 40)
    win.present()

    # CRITICAL: Force mouse passthrough for the entire screen. This must happen after win.present()
    # Create an empty cairo region and assign
    # In GTK4 Python, Gdk.surface.set_input_region takes a cairo.Region
    if (native := win.get_native()) is not None and (surface := native.get_surface()) is not None:
        empty_region = cairo.Region()
        surface.set_input_region(empty_region)


app = Gtk.Application(application_id="com.user.crosshair")
app.connect("activate", on_activate)
app.run(None)
