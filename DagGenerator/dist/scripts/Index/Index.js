﻿var info = {};
$(document).ready(function () {
    $('[data-toggle="tooltip"]').tooltip();

    $("#generate").click(function () {
        var settings = {};
        settings.nodes = $("#nodeCount").text();
        settings.minEdges = $("#edgeCountMin").text();
        settings.maxEdges = $("#edgeCountMax").text();
        settings.minComm = $("#commMin").text();
        settings.maxComm = $("#commMax").text();
        settings.minComp = $("#compMin").text();
        settings.maxComp = $("#compMax").text();
        settings.minLayers = $("#layersMin").text();
        settings.maxLayers = $("#layersMax").text();
        settings.criticalPath = $("#criticalPath")[0].checked;
        callDagAjax('/Home/GetDag', '{ settings: ' + JSON.stringify(settings) + ' }');
    });

    $("#edges").slider({
        id: "edges",
        tooltip: 'hide',
        value: [1, 10],
        formatter: function (value) {
            return 'Max edges: ' + value;
        }
    });
    $("#nodes").slider({
        id: "nodes",
        tooltip: 'hide',
        value: 200,
        formatter: function (value) {
            return 'Nodes: ' + value;
        }
    });
    $("#communication").slider({
        id: "communication",
        tooltip: 'hide',
        value: [5, 20],
        formatter: function (value) {
            return 'Nodes: ' + value;
        }
    });
    $("#computation").slider({
        id: "computation",
        tooltip: 'hide',
        value: [5, 30],
        formatter: function (value) {
            return 'Nodes: ' + value;
        }
    });

    var layersSlider = $("#layers").slider({
        id: "layers",
        tooltip: 'hide',
        value: [20, 30],
        max: 200,
        formatter: function (value) {
            return 'layers: ' + value;
        }
    });
    $("#layers").on('slide', function (slideEvt) {
        $("#layersMin").html(slideEvt.value[0]);
        $("#layersMax").html(slideEvt.value[1]);
    });
    $("#computation").on('slide', function (slideEvt) {
        $("#compMin").html(slideEvt.value[0]);
        $("#compMax").html(slideEvt.value[1]);
    });
    $("#communication").on('slide', function (slideEvt) {
        $("#commMin").html(slideEvt.value[0]);
        $("#commMax").html(slideEvt.value[1]);
    });
    $("#nodes").on('slide', function (slideEvt) {
        var nodeCount = slideEvt.value;
        var layersMax = layersSlider[0].value.split(',')[1];
        $("#nodeCount").html(nodeCount);
        layersSlider.slider('setAttribute', 'max', nodeCount);
        if (nodeCount < layersMax) {
            layersSlider.slider('setValue', [nodeCount / 3, nodeCount/2]);
        } else {
            layersSlider.slider('setValue', [parseInt(nodeCount / 3), parseInt(nodeCount/2)]);
        }
        $("#layersMin").html(nodeCount / 10);
        $("#layersMax").html(nodeCount);
    });

    $("#edges").on('slide', function (slideEvt) {
        $("#edgeCountMin").html(slideEvt.value[0]);
        $("#edgeCountMax").html(slideEvt.value[1]);
    });

    callDagAjax('/Home/GetDefaultDag', '{}');

    network.on('hoverNode', function (props) {
        var ids = props.node;
        $("#currentNode").html(ids);
        $("#CompNode").html(network.body.data.nodes.get(ids).label);
        $("#CriticalNode").html(network.body.data.nodes.get(ids).color === 'rgba(40, 178, 6, 0.8)' ? 'Yes' : 'No');
        $("#PrevEdgeNode").html(network.getConnectedNodes(ids, 'from').length);
        $("#NextEdgeNode").html(network.getConnectedNodes(ids, 'to').length);
    })
});

var data = {};
var options = {
    locale: 'en',
    autoResize: true,
    height: '100%',
    width: '100%',
    clickToUse: false,
    edges: {
        arrowStrikethrough: false,
        arrows: {
            to: { enabled: true, scaleFactor: 1, type: 'arrow' },
            middle: { enabled: false, scaleFactor: 1, type: 'arrow' },
            from: { enabled: false, scaleFactor: 1, type: 'arrow' }
        },
        hoverWidth: 0.1,
        selectionWidth: 1,
        smooth: {
            enabled: true,
            type: 'discrete',
        },
        width: 0.75
    },
    nodes: {
        shape: 'box',
        shapeProperties: {
            borderRadius: 0
        }
    },
    layout: {
        improvedLayout: true,
        hierarchical: {
            enabled: true,
            edgeMinimization: false,
            parentCentralization: true,
            blockShifting: true,
            direction: 'UD',        // UD, DU, LR, RL
            sortMethod: 'directed'   // hubsize, directed
        }
    },
    interaction: {
        selectConnectedEdges: true,
        hover: true,
        hoverConnectedEdges: false
    },
    physics: {
        enabled: true
    }
};

$.LoadingOverlaySetup({
    background: "rgba(0, 0, 0, 0.5)",
    image: "../dist/img/loader.svg"
});

function callDagAjax(callURL, data) {
    $.ajax({
        type: 'POST',
        data: data,
        contentType: 'application/json; charset=utf-8;',
        dataType: 'JSON',
        beforeSend: function () {
            $.LoadingOverlay("show");
        },
        url: callURL,
        success: function (returnVals) {
            network.setData({ nodes: new vis.DataSet(returnVals.nodes), edges: new vis.DataSet(returnVals.edges) });
            network.once('stabilized', function () {
                network.focus(0, { scale: 1.5, offset: { x: 0, y: -$("#mynetwork").height() / 2 + 30 }, animation: true });
            });
            $.LoadingOverlay('hide', true);
            $("#DagNodes").html(returnVals.Info.Nodes);
            $("#DagEdges").html(returnVals.Info.Edges);
            $("#DagEPF").html(returnVals.Info.CpTime);
        }
    });
}

var network = new vis.Network(document.getElementById('mynetwork'), data, options);