git log \
--author="vlebedynska" \
--date=format:"%F %T" \
--format=" \
commit:<span style='color:SlateBlue'> %h</span>,  \
author:<span style='color:DodgerBlue'> %an</span>,  \
date: <span style='color:MediumSeaGreen'> %ad</span> \
%n %n %B %n \
"
