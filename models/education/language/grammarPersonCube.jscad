/*
	A simple dice that has choices for all 3 grammatic persons
	in plural and singular
	
	If you think this code was useful BTC
	contributions are welcome at
	19sKN38N4yxWZXoZeAdXZb5rq9xk32aDP4
*/

/*
	Redistribution and use in source and binary forms, with or without
	modification, are permitted provided that the following conditions are met:

	1. Redistributions of source code must retain the above copyright notice, this
	   list of conditions and the following disclaimer.

	2. Redistributions in binary form must reproduce the above copyright notice,
	   this list of conditions and the following disclaimer in the documentation
	   and/or other materials provided with the distribution.

	3. Neither the name of the copyright holder nor the names of its
	   contributors may be used to endorse or promote products derived from
	   this software without specific prior written permission.

	THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
	AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
	IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
	DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
	FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
	DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
	SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
	CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
	OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
	OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

function getText3D(text) {
	var letterPolyline = vector_text(0,0,text);
	var letterObjects = new Array();
	letterPolyline.forEach(function(polyline) {
	   letterObjects.push(rectangular_extrude(polyline, {w: 4, h: 4}));
	});
	return union(letterObjects).scale(0.6);
}

function main() {
	return difference(
		cube({ size: [30, 30, 30], center: true }),
		union(
			getText3D("1S").translate([-12,-7,15-2]),
			getText3D("1P").translate([-12,-7,15-2]).rotateX(180),
			
			getText3D("2S").translate([-12,-7,15-2]).rotateY(90),
			getText3D("2P").translate([-12,-7,15-2]).rotateY(-90).rotateX(180),
			
			getText3D("3S").translate([-12,-7,15-2]).rotateY(90).rotateZ(90),
			getText3D("3P").translate([-12,-7,15-2]).rotateY(-90).rotateZ(-90).rotateX(180)
		)
	).scale(2/3);
}