//package de.fhg.iais.roberta.syntax.ai.reinforcementlearning;
//
//import de.fhg.iais.roberta.blockly.generated.Block;
//import de.fhg.iais.roberta.blockly.generated.Field;
//import de.fhg.iais.roberta.blockly.generated.Value;
//import de.fhg.iais.roberta.inter.mode.action.IDriveDirection;
//import de.fhg.iais.roberta.syntax.*;
//import de.fhg.iais.roberta.syntax.action.Action;
//import de.fhg.iais.roberta.syntax.action.motor.differential.DriveAction;
//import de.fhg.iais.roberta.transformer.AbstractJaxb2Ast;
//import de.fhg.iais.roberta.transformer.ExprParam;
//import de.fhg.iais.roberta.typecheck.BlocklyType;
//import de.fhg.iais.roberta.visitor.IVisitor;
//
//import java.util.List;
//
//public class RlDriveOptimalPath <V> extends DriveAction<V> {
//
//    private final IDriveDirection direction;
//    private final MotionParam<V> param;
//
//    /**
//     * This constructor set the kind of the action object used in the AST (abstract syntax tree). All possible kinds can be found in {@link BlockType}.
//     *  @param kind       of the the action object used in AST,
//     * @param properties of the block,
//     * @param comment    of the user for the specific block
//     * @param direction
//     * @param param
//     */
//    private RlDriveOptimalPath(BlockType kind, BlocklyBlockProperties properties, BlocklyComment comment, IDriveDirection direction, MotionParam<V> param) {
//        super(kind, properties, comment);
//        this.direction = direction;
//        this.param = param;
//    }
//
//    public static <V> RlDriveOptimalPath<V> make(BlocklyBlockProperties properties, BlocklyComment comment, IDriveDirection direction, MotionParam<V> param) {
//        return new RlDriveOptimalPath<V>(BlockTypeContainer.getByName("AI_RL_Q_DRIVE_OPTIMAL_PATH"), properties, comment, direction, param);
//    }
//
//    public String toString() {
//        return this.getClass().getSimpleName() + " [" + " TestTest: " + " ]";
//    }
//
//
//
//    public static <V> Phrase<V> jaxbToAst(Block block, AbstractJaxb2Ast<V> helper) {
//        List<Value> values = helper.extractValues(block, (short) 1);
//        Phrase<V> power = helper.extractValue(values, new ExprParam(BlocklyConstants.POWER, BlocklyType.NUMBER_INT));
//        MotionParam<V> mp = new MotionParam.Builder<V>().speed(helper.convertPhraseToExpr(power)).build();
//        String mode = "XY" ; //factory.getDriveDirection(mode)
//
//        return RlDriveOptimalPath.make(helper.extractBlockProperties(block), helper.extractComment(block), mp, mode);
//    }
//
//
//
//
//    @Override protected V acceptImpl(IVisitor<V> visitor) {
//        return null;
//    }
//
//    @Override public Block astToBlock() {
//        return null;
//    }
//}
