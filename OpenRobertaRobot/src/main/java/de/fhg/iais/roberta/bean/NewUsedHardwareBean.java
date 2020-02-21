package de.fhg.iais.roberta.bean;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import de.fhg.iais.roberta.syntax.BlockType;
import de.fhg.iais.roberta.util.Pair;

public class NewUsedHardwareBean implements IProjectBean {
    private final List<Pair<BlockType, String>> blockPortMappings = new ArrayList<>();

    public List<Pair<BlockType, String>> getBlockPortMappings() {
        return Collections.unmodifiableList(blockPortMappings);
    }

    public static class Builder implements IBuilder<NewUsedHardwareBean> {
        private final NewUsedHardwareBean usedHardwareBean = new NewUsedHardwareBean();

        public NewUsedHardwareBean.Builder addBlockPortMapping(Pair<BlockType, String> blockPortMapping) {
            this.usedHardwareBean.blockPortMappings.add(blockPortMapping);
            return this;
        }

        public NewUsedHardwareBean build() {
            return this.usedHardwareBean;
        }
    }
}
