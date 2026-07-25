import QtQuick
import Quickshell.Io
import qs.Common
import qs.Services
import qs.Widgets
import qs.Modules.Plugins

PluginComponent {
    id: root

    property string variantId: ""
    property var variantData: null

    property string displayIcon: "terminal"
    property string displayText: ""
    property string displayCommand: ""
    property string clickCommand: ""
    property string middleClickCommand: ""
    property string rightClickCommand: ""
    property int updateInterval: 0
    property bool showIcon: true
    property bool showText: true

    property string currentOutput: ""
    property bool isLoading: false

    // Process executor for testing desktop notifications
    Process {
        id: notifyProcess
        command: ["dms", "ipc", "call", "dash", "toggle", "wallpaper"]
    }

    // Override the default pill click action to open the Wallpaper Dash tab
    pillClickAction: (x, y, width, section, screen) => {
        popoutService?.toggleDankDash(0, x, y, width, "wallpaper", screen);
    }

    // Tell DMS how to render this widget on horizontal bars
    horizontalBarPill: Component {
        Rectangle {
            implicitWidth: 32
            implicitHeight: 32
            color: "transparent"
            radius: 6

            Text {
                anchors.centerIn: parent
                text: "🖼️"
                font.pixelSize: 16
            }

            MouseArea {
                id: mouseArea
                anchors.fill: parent
                hoverEnabled: true
                cursorShape: Qt.PointingHandCursor

                onClicked: {
                    notifyProcess.running = true;
                }
            }
        }
    }
}
