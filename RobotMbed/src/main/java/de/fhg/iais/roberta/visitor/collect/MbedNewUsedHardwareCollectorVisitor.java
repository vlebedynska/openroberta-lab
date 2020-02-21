package de.fhg.iais.roberta.visitor.collect;

import de.fhg.iais.roberta.bean.NewUsedHardwareBean;

public class MbedNewUsedHardwareCollectorVisitor extends AbstractNewUsedHardwareCollectorVisitor implements IMbedCollectorVisitor {
    public MbedNewUsedHardwareCollectorVisitor(NewUsedHardwareBean.Builder builder) {
        super(builder);
    }
}
