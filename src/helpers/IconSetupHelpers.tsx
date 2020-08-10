import React from "react";
import { initializeIcons } from "@uifabric/icons";
import { registerIcons } from "office-ui-fabric-react";

export default class IconSetupHelpers {
    static initializeIcons() {
        initializeIcons();

        registerIcons({
            icons: {
                // https://iconcloud.design/home/search/camera/Full%20MDL2%20Assets/Full%20MDL2%20Assets/eb35
                SecurityCamera: (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2048 2048" width="1em" height="1em">
                        <path
                            fill="currentColor"
                            d="M1833 925l-71-18-234 469-632-158v702H0v-128h768v-606l-128-32v510H0v-128h512v-414L50 1007q57-224 112-446t111-446l1747 437-187 373zM366 271l-36 146 1413 354-13 54 13-54 21 5 70-139L366 271zm1269 605L299 542l-93 371 1253 314 176-351z"
                        />
                    </svg>
                )
            }
        });
    }
}
