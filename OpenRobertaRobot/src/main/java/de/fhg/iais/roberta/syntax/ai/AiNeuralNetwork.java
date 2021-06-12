package de.fhg.iais.roberta.syntax.ai;

import java.util.ArrayList;
import java.util.List;

import de.fhg.iais.roberta.blockly.generated.Block;
import de.fhg.iais.roberta.blockly.generated.Value;
import de.fhg.iais.roberta.syntax.*;
import de.fhg.iais.roberta.syntax.lang.expr.Expr;
import de.fhg.iais.roberta.syntax.lang.expr.ListCreate;
import de.fhg.iais.roberta.syntax.lang.stmt.Stmt;
import de.fhg.iais.roberta.transformer.AbstractJaxb2Ast;
import de.fhg.iais.roberta.transformer.Ast2JaxbHelper;
import de.fhg.iais.roberta.transformer.ExprParam;
import de.fhg.iais.roberta.typecheck.BlocklyType;
import de.fhg.iais.roberta.visitor.IVisitor;
import de.fhg.iais.roberta.visitor.ai.IAiVisitor;

/**
 * This class represents <b>ai_neural_network</b> block from Blockly into the AST (abstract syntax tree). Object from this
 * class will generate neural network including input and output layers.<br/>
 * <br>
 * To create an instance from this class use the method {@link #make(ListCreate, ListCreate, List, BlocklyBlockProperties, BlocklyComment)}.<br>
 */
public class AiNeuralNetwork<V> extends Stmt<V> {

    private final ListCreate<V> listNNInput;
    private final ListCreate<V> listNNOutput;
    private final List<AiLink<V>> listNNLinks;

    public ListCreate<V> getListNNInput() {
        return listNNInput;
    }

    public ListCreate<V> getListNNOutput() {
        return listNNOutput;
    }

    public List<AiLink<V>> getListNNLinks() {
        return listNNLinks;
    }

    /**
     * This constructor set the kind of the object used in the AST (abstract syntax tree). All possible kinds can be found in {@link BlockType}.
     * @param kind
     * @param listNNInput
     * @param listNNOutput
     * @param listNNLinks
     * @param property
     * @param comment
     */
    private AiNeuralNetwork(
        BlockType kind,
        ListCreate<V> listNNInput,
        ListCreate<V> listNNOutput,
        List<AiLink<V>> listNNLinks,
        BlocklyBlockProperties property,
        BlocklyComment comment) {
        super(kind, property, comment);
        this.listNNInput = listNNInput;
        this.listNNOutput = listNNOutput;
        this.listNNLinks = listNNLinks;
        setReadOnly();
    }

    /**
     * creates a new {@link #AiNeuralNetwork} instance;
     *
     * @param listNNInput
     * @param listNNOutput
     * @param listNNLinks
     * @param properties
     * @param comment
     * @param <V>
     * @return
     */
    public static <V> AiNeuralNetwork<V> make(
        ListCreate<V> listNNInput,
        ListCreate<V> listNNOutput,
        List<AiLink<V>> listNNLinks,
        BlocklyBlockProperties properties,
        BlocklyComment comment) {
        return new AiNeuralNetwork<V>(BlockTypeContainer.getByName("AI_NEURAL_NETWORK"), listNNInput, listNNOutput, listNNLinks, properties, comment);
    }

    /**
     * implements
     * @param visitor
     * @return
     */
    @Override
    protected V acceptImpl(IVisitor<V> visitor) {
        return ((IAiVisitor<V>) visitor).visitAiNeuralNetwork(this);
    }

    @Override
    public String toString() {
        return this.getClass().getSimpleName() + " [" + " Input-Layer: " + listNNInput + " Output-Layer: " + listNNOutput + " ]";
    }

    /**
     * TODO Doku
     */
    public static <V> Phrase<V> jaxbToAst(Block block, AbstractJaxb2Ast<V> helper) {
        List<Value> values = helper.extractValues(block, (short) 2);
        ListCreate<V> inputLayer =
            (ListCreate<V>) helper.extractValue(values, new ExprParam(BlocklyConstants.INPUT_LAYER, BlocklyType.STRING));
        ListCreate<V> outputLayer =
            (ListCreate<V>) helper.extractValue(values, new ExprParam(BlocklyConstants.OUTPUT_LAYER, BlocklyType.STRING));

        List<AiLink<V>> listNNLinks = new ArrayList<>();
        for ( Expr<V> inputNode : inputLayer.getExprList().getEl() ) {
            for ( Expr<V> outputNode : outputLayer.getExprList().getEl() ) {
                AiLink<V> oneInputOutputLink = new AiLink<V>(inputNode, outputNode, 0);
                listNNLinks.add(oneInputOutputLink);
            }
        }
        return AiNeuralNetwork.make(inputLayer, outputLayer, listNNLinks, helper.extractBlockProperties(block), helper.extractComment(block));
    }

    @Override
    public Block astToBlock() {
        Block jaxbDestination = new Block();
        Ast2JaxbHelper.setBasicProperties(this, jaxbDestination);
        Ast2JaxbHelper.addValue(jaxbDestination, BlocklyConstants.INPUT_LAYER, getListNNInput());
        Ast2JaxbHelper.addValue(jaxbDestination, BlocklyConstants.OUTPUT_LAYER, getListNNOutput());
        return  jaxbDestination;
    }

}
