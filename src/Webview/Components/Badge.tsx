import React from "react";

interface BadgeProps {
    content: number;
    //ToDo Add different Background Colors based off Priority
}

export const Badge: React.FunctionComponent<BadgeProps> = (props) => {
    const { content } = props;

    const badgeContainer: React.CSSProperties = {
        marginLeft: "5px"
    };

    const badgeContent: React.CSSProperties = {
        borderRadius: "25px",
        backgroundColor: "gray",
        minWidth: "25px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white"
    };

    return (
        <div style={badgeContainer}>
            <div style={badgeContent}>{content}</div>
        </div>
    );
};
