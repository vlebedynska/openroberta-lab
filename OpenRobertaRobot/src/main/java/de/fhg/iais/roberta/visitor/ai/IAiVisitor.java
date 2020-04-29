package de.fhg.iais.roberta.visitor.ai;

import de.fhg.iais.roberta.syntax.ai.AiInput;
import de.fhg.iais.roberta.syntax.ai.AiNeuralNetwork;
import de.fhg.iais.roberta.util.dbc.DbcException;
import de.fhg.iais.roberta.visitor.IVisitor;

/**
 * Interface to be used to add robot specific hardware to the visiting process.
 */
public interface IAiVisitor<V> extends IVisitor<V> {
    //output
    //inputVisotor

    /**
     * visit a {@link AiInput}.
     *
     * @param aiInputNode to be visited
     */
    default V visitAiInputNode(AiInput<V> aiInputNode) {
        throw new DbcException("AI input node is not implemented!");
    }

    default V visitAiNeuralNetwork(AiNeuralNetwork<V> vAiNeuralNetwork) {
        throw new DbcException("AI neural network is not implemented!");
    }
}

