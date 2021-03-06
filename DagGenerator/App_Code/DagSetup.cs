﻿using DagGenerator.App_Code.VisSupport;
using DagGenerator.Models;
using DagGeneratorLibrary;
using System.Collections.Generic;
using System.Text;

namespace DagGenerator.App_Code
{
    public class DagSetup
    {
        public Settings Settings { get; set; }
        private DagGenerate dg { get; set; }
        public VisInfoHolder CreateDag()
        {
            dg = new DagGenerate
            {
                Nodes = Settings.Nodes,
                MinEdge = Settings.MinEdges,
                MaxEdge = Settings.MaxEdges,
                MinComp = Settings.MinComp,
                MaxComp = Settings.MaxComp,
                MinComm = Settings.MinComm,
                MaxComm = Settings.MaxComm,
                MaxLayers = Settings.MaxLayers,
                MinLayers = Settings.MinLayers,
                CreateCriticalPath = Settings.CriticalPath
            };
            return DagNodeJson(dg.Generate());
        }

        private VisInfoHolder DagNodeJson(Dag d)
        {
            HashSet<DagNode> nodes = new HashSet<DagNode>();
            StringBuilder str = new StringBuilder();
            VisInfoHolder vih = new VisInfoHolder
            {
                nodes = new List<NodesDataSet>(),
                edges = new List<EdgesDataSet>()
            };
            foreach(DagEdge edge in d.GetDagEdgeSet())
            {
                nodes.Add(edge.PrevNode);
            }
            foreach (DagNode node in nodes)
            {
                vih.nodes.Add(new NodesDataSet { id = node.Id, label = node.CompTime.ToString(), color = node.CriticalPath ? "rgba(40, 178, 6, 0.8)" : "rgba(167, 162, 162, 0.65)" });
                foreach (DagNode nextNode in node.GetNextNodes())
                {
                    bool CpEdge = (node.CriticalPath && nextNode.CriticalPath);
                    vih.edges.Add(new EdgesDataSet { from = node.Id, to = nextNode.Id, color = new Color { color = CpEdge ? "rgba(40, 178, 6, 0.8)" : "rgba(167, 162, 162, 0.65)" }, label = d.FindEdge(node, nextNode)?.CommTime.ToString() });
                }
            }
            vih.Info = new DagInfo { Nodes = nodes.Count, Edges = d.GetDagEdgeSet().Count, CpTime = d.CpTime };
            return vih;
        }
    }
}