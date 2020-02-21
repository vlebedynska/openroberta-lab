package de.fhg.iais.roberta.worker;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import de.fhg.iais.roberta.bean.NewUsedHardwareBean;
import de.fhg.iais.roberta.components.Category;
import de.fhg.iais.roberta.components.ConfigurationAst;
import de.fhg.iais.roberta.components.ConfigurationComponent;
import de.fhg.iais.roberta.components.Project;
import de.fhg.iais.roberta.syntax.BlockType;
import de.fhg.iais.roberta.util.Pair;

public class CalliopeConfigurationGenerator implements IWorker {
    // TODO different solution?
    private static final Map<String, String> nameToConfBlockMap = new HashMap<>();
    static {
        nameToConfBlockMap.put("KEYS_SENSING", "robConf_key");
    }

    @Override
    public void execute(Project project) {
        if (project.isDefaultConfiguration()) {
            NewUsedHardwareBean usedHardwareBean = project.getWorkerResult(NewUsedHardwareBean.class);

            Map<String, ConfigurationComponent> components = new HashMap<>(project.getConfigurationAst().getConfigurationComponents());
            for ( Pair<BlockType, String> blockPortMapping : usedHardwareBean.getBlockPortMappings() ) {
                components.put(blockPortMapping.getSecond(),
                    new ConfigurationComponent(
                    nameToConfBlockMap.get(blockPortMapping.getFirst().getName()),
                    blockPortMapping.getFirst().getCategory().equals(Category.ACTOR),
                    blockPortMapping.getSecond(),
                    blockPortMapping.getSecond(),
                    Collections.emptyMap()));
            }

            ConfigurationAst.Builder builder = new ConfigurationAst.Builder();
            builder.addComponents(new ArrayList<>(components.values()));
            ConfigurationAst configuration = builder.build();
            project.addConfigurationAst(configuration);
        }
    }
}
