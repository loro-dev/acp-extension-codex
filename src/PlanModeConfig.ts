import type {SessionConfigOption} from "@agentclientprotocol/sdk";

export const PLAN_MODE_CONFIG_ID = "plan-mode";
export const PLAN_MODE_ON = "on";
export const PLAN_MODE_OFF = "off";

const PLAN_MODE_DESCRIPTION = "Plan without modifying files; switch off to implement the approved plan";

export function createPlanModeConfigOption(planModeEnabled: boolean): SessionConfigOption {
    return {
        id: PLAN_MODE_CONFIG_ID,
        name: "Plan mode",
        description: PLAN_MODE_DESCRIPTION,
        category: PLAN_MODE_CONFIG_ID,
        type: "select",
        currentValue: planModeEnabled ? PLAN_MODE_ON : PLAN_MODE_OFF,
        options: [
            {
                value: PLAN_MODE_OFF,
                name: "Off",
                description: "Implement changes normally",
            },
            {
                value: PLAN_MODE_ON,
                name: "On",
                description: PLAN_MODE_DESCRIPTION,
            },
        ],
    };
}
