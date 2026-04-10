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

CDLL("libgtk4-layer-shell.so")

import gi  # noqa
gi.require_version("Gtk", "4.0")
gi.require_version("Gdk", "4.0")
gi.require_version("Gtk4LayerShell", "1.0")

from gi.repository import Gdk, Gtk, Gtk4LayerShell  # noqa


def on_activate(app):
    win = Gtk.ApplicationWindow(application=app)

    # Initialize Layer Shell for this window
    Gtk4LayerShell.init_for_window(win)

    # Set the Namespace (Crucial for niri config matching)
    Gtk4LayerShell.set_namespace(win, "crosshair-overlay")

    # Set the Layer to OVERLAY
    Gtk4LayerShell.set_layer(win, Gtk4LayerShell.Layer.OVERLAY)

    # Make it click-through (no keyboard/mouse focus)
    Gtk4LayerShell.set_keyboard_mode(win, Gtk4LayerShell.KeyboardMode.NONE)

    # Visuals: Transparent background
    css_provider = Gtk.CssProvider()
    css_provider.load_from_data(b"window { background: none; }")
    Gtk.StyleContext.add_provider_for_display(Gdk.Display.get_default(), css_provider, Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION)

    # Draw the Dot
    draw_area = Gtk.DrawingArea()

    def draw_func(area, cr, width, height):
        # calibrate the center using https://centerofmyscreen.com/
        cr.arc(width/2, height/2 - 14, 2, 0, 2 * 3.14159)
        cr.set_source_rgba(0, 1.0, 0, 1.0)  # Green
        cr.fill()

    draw_area.set_draw_func(draw_func)
    win.set_child(draw_area)

    # Size & Position
    # Layer shell centers by default if no anchors are set
    win.set_default_size(4, 40)
    win.present()

    # CRITICAL: Force mouse passthrough for the entire screen. This must happen after win.present()
    # Create an empty cairo region and assign
    # In GTK4 Python, Gdk.surface.set_input_region takes a cairo.Region
    surface = win.get_native().get_surface()
    empty_region = cairo.Region()
    surface.set_input_region(empty_region)


app = Gtk.Application(application_id="com.user.crosshair")
app.connect("activate", on_activate)
app.run(None)
