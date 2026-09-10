import React from "react";
export default function ProductCard({p,onClick}){return <article className="card" onClick={()=>onClick(p)}>
 <div className="cardImg"><img src={p.image} loading="lazy"/><span>{p.tag}</span><i>↗</i></div>
 <div className="cardBody"><small>{p.cat}</small><h3>{p.name}</h3><div className="cardFoot"><b>{p.price}</b><button>View details</button></div></div>
 </article>}