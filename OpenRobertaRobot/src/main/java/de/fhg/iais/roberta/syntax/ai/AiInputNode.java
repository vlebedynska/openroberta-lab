package de.fhg.iais.roberta.syntax.ai;
import de.fhg.iais.roberta.syntax.*;
import de.fhg.iais.roberta.syntax.sensor.ExternalSensor;
import org.json.JSONObject;

public abstract class AiInputNode<V> extends AiNode<V> {

    //public static final int DEFAULT_THRESHOLD = 0;
    protected final ExternalSensor<V> externalSensor;


    protected AiInputNode(
        BlockType kind, ExternalSensor<V> externalSensor, Integer threshold, BlocklyBlockProperties property, BlocklyComment comment, JSONObject nodeData) {
        super(kind, threshold, property, comment, nodeData);
        this.externalSensor = externalSensor;
        setReadOnly();
    }

    public ExternalSensor<V> getExternalSensor() {
        return externalSensor;
    }
}
