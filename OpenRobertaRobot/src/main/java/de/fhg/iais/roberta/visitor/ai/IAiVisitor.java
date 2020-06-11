package de.fhg.iais.roberta.visitor.ai;

import de.fhg.iais.roberta.syntax.Phrase;
import de.fhg.iais.roberta.syntax.ai.AiInput;
import de.fhg.iais.roberta.syntax.ai.AiInputNodeColourSensor;
import de.fhg.iais.roberta.syntax.ai.AiNeuralNetwork;
import de.fhg.iais.roberta.syntax.ai.AiOutput;
import de.fhg.iais.roberta.syntax.ai.reinforcementlearning.*;
import de.fhg.iais.roberta.util.dbc.DbcException;
import de.fhg.iais.roberta.visitor.IVisitor;

/**
 * Interface to be used to add robot specific hardware to the visiting process.
 */
public interface IAiVisitor<V> extends IVisitor<V> {
    //output
    //inputVisotor

    default DbcException getNotImplementedException(Phrase<V> phrase) {
        String message = phrase.getKind().getName() + " is not implemented for " + this.getClass().getSimpleName() + "! " + phrase.getKind();
        return new DbcException(message);
    };

    /**
     * visit a {@link AiInput}.
     *
     * @param aiInputNode to be visited
     */
    default V visitAiInputNode(AiInput<V> aiInputNode) {
        throw getNotImplementedException(aiInputNode);
    }

    default V visitAiNeuralNetwork(AiNeuralNetwork<V> vAiNeuralNetwork) {
        throw getNotImplementedException(vAiNeuralNetwork);

    }

    default V visitAiOutputNode(AiOutput<V> aiOutputNode) {
        throw getNotImplementedException(aiOutputNode);
    }

    default V visitAiInputNodeColourSensor(AiInputNodeColourSensor<V> aiInputNodeColourSensor) {
        throw getNotImplementedException(aiInputNodeColourSensor);
    }

    default V visitAiRlEnvironment(RlEnvironment<V> rlEnvironment) {throw getNotImplementedException(rlEnvironment);}

    default V visitAiRlGainExperience(RlGainExperience<V> rlGainExperience) {throw getNotImplementedException(rlGainExperience);}

    default V visitAiRlObstacle(RlObstacle<V> rlObstacle) {throw getNotImplementedException(rlObstacle);}

    default V visitAiRlSetUpQLearningBehaviour(RlSetUpQLearningBehaviour<V> rlSetUpQLearningBehaviour) {throw getNotImplementedException(rlSetUpQLearningBehaviour);}

    default V visitAiRlDrawOptimalPath(RlDrawOptimalPath<V> rlDrawOptimalPath) {throw getNotImplementedException(rlDrawOptimalPath);}

}
