package de.fhg.iais.roberta.visitor.collect;

import static de.fhg.iais.roberta.visitor.collect.RaspberryPiMethods.*;

import java.util.ArrayList;
import java.util.Collections;
import java.util.EnumSet;
import java.util.LinkedHashSet;
import java.util.Set;

import de.fhg.iais.roberta.components.Configuration;
import de.fhg.iais.roberta.syntax.Phrase;
import de.fhg.iais.roberta.syntax.action.light.LightAction;
import de.fhg.iais.roberta.syntax.action.raspberrypi.LedBlinkAction;
import de.fhg.iais.roberta.syntax.action.raspberrypi.LedDimAction;
import de.fhg.iais.roberta.syntax.action.raspberrypi.LedGetAction;
import de.fhg.iais.roberta.syntax.action.raspberrypi.LedSetAction;
import de.fhg.iais.roberta.syntax.lang.expr.ColorHexString;
import de.fhg.iais.roberta.syntax.lang.stmt.IntentStmt;
import de.fhg.iais.roberta.syntax.lang.stmt.Stmt;
import de.fhg.iais.roberta.syntax.lang.stmt.WaitStmt;
import de.fhg.iais.roberta.syntax.sensor.generic.GetSampleSensor;
import de.fhg.iais.roberta.syntax.sensor.generic.KeysSensor;
import de.fhg.iais.roberta.syntax.sensors.raspberrypi.SlotSensor;
import de.fhg.iais.roberta.visitor.hardware.IRaspberryPiVisitor;

/**
 * This class visits all the sensors/actors of the RaspberryPi brick and collects information about them
 */
public class RaspberryPiUsedHardwareCollectorVisitor extends AbstractUsedHardwareCollectorVisitor implements IRaspberryPiVisitor<Void> {
    private final Set<RaspberryPiMethods> usedMethods = EnumSet.noneOf(RaspberryPiMethods.class); //All needed helper methods as a Set
    protected final Set<String> usedIntents = new LinkedHashSet<>();

    public RaspberryPiUsedHardwareCollectorVisitor(ArrayList<ArrayList<Phrase<Void>>> programPhrases, Configuration robotConfiguration) {
        super(robotConfiguration);
        check(programPhrases);
    }

    public Set<String> getIntents() {
        return this.usedIntents;
    }

    @Override
    public Void visitWaitStmt(WaitStmt<Void> waitStmt) {
        //visit all statements to add their helper methods
        for ( Stmt<Void> s : waitStmt.getStatements().get() ) {
            s.visit(this);
        }
        return super.visitWaitStmt(waitStmt);
    }

    /**
     * Returns all methods that need additional helper methods.
     *
     * @return all used methods
     */
    public Set<RaspberryPiMethods> getUsedMethods() {
        return Collections.unmodifiableSet(this.usedMethods);
    }

    /**
     * visit a {@link GetSampleSensor}.
     *
     * @param sensorGetSample to be visited
     */
    @Override
    public Void visitGetSampleSensor(GetSampleSensor<Void> sensorGetSample) {
        switch ( sensorGetSample.getSensorTypeAndMode() ) {
            case "KEY_PRESSED":
                this.markedVariablesAsGlobal.add("board");
                this.usedMethods.add(KEY_PRESSED);
                break;
        }
        return null;
    }

    @Override
    public Void visitColorHexString(ColorHexString<Void> colorHexString) {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public Void visitLedSetAction(LedSetAction<Void> ledSetAction) {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public Void visitLedBlinkAction(LedBlinkAction<Void> ledBlinkAction) {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public Void visitLedDimAction(LedDimAction<Void> ledDimAction) {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public Void visitLedGetAction(LedGetAction<Void> ledGetAction) {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public Void visitIntentStmt(IntentStmt<Void> intentStmt) {
        this.usedMethods.add(CONTAINS);
        this.usedIntents.add(intentStmt.getIntent());
        //visit all statements to add their helper methods
        intentStmt.getExpr().forEach(expr -> expr.visit(this));
        intentStmt.getThenList().forEach(expr -> expr.visit(this));
        intentStmt.getElseList().visit(this);

        for ( Stmt<Void> s : intentStmt.getThenList() ) {
            s.visit(this);
        }
        for ( Stmt<Void> s : intentStmt.getElseList().get() ) {
            s.visit(this);
        }
        return null;
    }

    @Override
    public Void visitSlotSensor(SlotSensor<Void> slotSensor) {
        this.usedMethods.add(CONTAINS);
        return null;
    }

    @Override
    public Void visitKeysSensor(KeysSensor<Void> keysSensor) {
        this.markedVariablesAsGlobal.add("board");
        this.usedMethods.add(KEY_PRESSED);
        System.out.println(this.usedMethods.toString());
        
        return null;
    }

    @Override
    public Void visitLightAction(LightAction<Void> lightStatusAction) {
        this.markedVariablesAsGlobal.add("board");
        return null;
    }
}