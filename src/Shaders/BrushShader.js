/**
 * BrushShader
 */

export const brushShader = {

  uniforms: {
    'tDiffuse': { value: null },
    'uCombing': { value: false },
    'uCursorPos': { value: [200, 200] },
    'uRadius': { value: 50 }

  },

  vertexShader: /* glsl */`

    varying vec2 textCoord;

		void main() {

			textCoord = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,

  fragmentShader: /* glsl */`

  varying vec2 textCoord;
   
  uniform sampler2D tDiffuse;
  uniform int uCombing;
  uniform float uRadius;
  uniform vec2 uCursorPos;

void main() {
  vec4 color = vec4(texture(tDiffuse,textCoord).rgb,1.0);
      if(uCombing==1){
          float distanceX = abs(gl_FragCoord.x - uCursorPos.x);
          float distanceY = abs(gl_FragCoord.y - uCursorPos.y);
          float composeDistance = sqrt(distanceX*distanceX + distanceY * distanceY);

          float distanceToBorder = uRadius-composeDistance;\r
          float att;\r
          float brushEdge = uRadius*0.25;\r

          distanceToBorder<=brushEdge ? att= distanceToBorder/brushEdge : att=1.0;\r

      //Circle brush
          if(composeDistance <= uRadius )
              color = mix(color,vec4(0.0,1.0,0.1,1.0),0.5*att);
      //Brush edge
          if(composeDistance <= uRadius && composeDistance >= uRadius-1.0)
              color = mix(vec4(0.0,0.0,0.1,1.0),color,0.5);
      }

  gl_FragColor = color;
}
`

};

