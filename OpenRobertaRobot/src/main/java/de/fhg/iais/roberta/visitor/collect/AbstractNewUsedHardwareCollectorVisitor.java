package de.fhg.iais.roberta.visitor.collect;
import de.fhg.iais.roberta.bean.NewUsedHardwareBean;
import de.fhg.iais.roberta.syntax.sensor.generic.KeysSensor;
import de.fhg.iais.roberta.util.Pair;

public class AbstractNewUsedHardwareCollectorVisitor implements ICollectorVisitor {

    protected NewUsedHardwareBean.Builder builder;

    public AbstractNewUsedHardwareCollectorVisitor(NewUsedHardwareBean.Builder builder) {
        this.builder = builder;
    }

    @Override
    public Void visitKeysSensor(KeysSensor<Void> keysSensor) {
        this.builder.addBlockPortMapping(Pair.of(keysSensor.getKind(), keysSensor.getPort()));
        return null;
    }
}
