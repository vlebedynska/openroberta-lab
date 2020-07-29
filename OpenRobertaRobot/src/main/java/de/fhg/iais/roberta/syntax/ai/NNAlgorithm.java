package de.fhg.iais.roberta.syntax.ai;

import java.util.ArrayList;
import java.util.List;

public class NNAlgorithm {

    public static void main(String[] args) {

        int schwellenWert = 2;
        int schwellenWert2 = 2;

        int ultraschalsensor = 30;
        int ultraschalsensor2 = 2;

        Node node = new Node(ultraschalsensor, schwellenWert);
        Node node2 = new Node(ultraschalsensor2, schwellenWert2);

        List<Node> inputLayer = new ArrayList<>();
        inputLayer.add(node);
        inputLayer.add(node2);

        Node nodeOutput1 = new Node(0, 0);
        Node nodeOutput2 = new Node(0, 0);

        List<Node> outputLayer = new ArrayList<>();
        outputLayer.add(nodeOutput1);
        outputLayer.add(nodeOutput2);

        List<Kante> kanten = new ArrayList<>();
        //30 * 1 = 30 (nodeOutput1)
        //30 * 0 = 0 (nodeOutput2)
        //2 * 1 = 2 (nodeOutput2);
        //2 * 0 = 0 (nodeOutput1)
        kanten.add(new Kante(inputLayer.get(0), outputLayer.get(0), 1));
        kanten.add(new Kante(inputLayer.get(0), outputLayer.get(1), 0));
        kanten.add(new Kante(inputLayer.get(1), outputLayer.get(1), 1));
        kanten.add(new Kante(inputLayer.get(1), outputLayer.get(0), 0));

        //outputLayer.get(0).sensorWert = inputLayer.get(0).sensorWert * kanten.get(0).gewicht;

        for ( Node tempNode : outputLayer ) {
            for ( Kante kante : kanten ) {
                if ( tempNode == kante.nodeOutput ) {
                    tempNode.sensorWert = tempNode.sensorWert + (kante.nodeInput.sensorWert * kante.gewicht);
                }
            }
            //nehme alle Kanten und schaue, ob sie zum temNode passen

        }

        System.out.println(outputLayer.toString());
    }

    public static class Node {
        int sensorWert;
        int schwellenWert;

        private Node(int sensorWert, int schwellenWert) {
            this.sensorWert = sensorWert;
            this.schwellenWert = schwellenWert;

        }

        @Override public String toString() {
            return "Sensorwert: " + sensorWert + " Schwellenwert: " + schwellenWert;
        }
    }

    public static class Kante {
        Node nodeInput;
        Node nodeOutput;
        int gewicht;

        private Kante(Node nodeInput, Node nodeOutput, int gewicht) {
            this.nodeInput = nodeInput;
            this.nodeOutput = nodeOutput;
            this.gewicht = gewicht;
        }
    }

}
