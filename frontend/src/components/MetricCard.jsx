import React from "react";
import Icon from "./Icon";
import "../assets/styles.css";
export const MetricCard = ({ title, value, subtext, trend, trendPositive = true, iconName, }) => {
    return (<div className="metric-card-div-1">
      <div className="metric-card-div-2">
        <span className="metric-card-span-1">
          {title}
        </span>
        {iconName && (<span className="metric-card-span-2">
            <Icon name={iconName} size={16}/>
          </span>)}
      </div>

      <div className="metric-card-div-3">
        <span className="metric-card-span-3">
          {value}
        </span>
      </div>

      <div className="metric-card-div-4">
        {trend && (<span className={`metric-card-span-4 ${trendPositive ? "metric-card-span-5" : "metric-card-span-6"}`}>
            {trend}
          </span>)}
        <span className="metric-card-span-7">{subtext}</span>
      </div>
    </div>);
};
export default MetricCard;
