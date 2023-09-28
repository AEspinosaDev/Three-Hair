class Edge {
    constructor(a, b, o) {
        if (a < b) {
            this.a = a;
            this.b = b;

        }
        else {
            this.b = a;
            this.a = b;
        }
        this.o = o;

        this.hash = this.getHashCode();
    }
    getHashCode() {
        var pts = new Array();
        pts.push(this.a); pts.push(this.b);
        pts = pts.sort((a, b) => { return a - b; });
        var hcode = (pts[0] >= pts[1] ? (pts[0] * pts[0]) + pts[0] + pts[1] : (pts[1] * pts[1]) + pts[0]); // Szudzik pairing
        return hcode;
    }


}

export { Edge}