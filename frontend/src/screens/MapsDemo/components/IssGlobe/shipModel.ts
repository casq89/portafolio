import { BoxGeometry, CylinderGeometry, Group, Mesh, MeshLambertMaterial } from 'three';

// A small low-poly ISS: a long truss with four pairs of golden solar arrays and the
// pressurized modules across it. Built facing +z (the direction of flight) with +y
// pointing away from the Earth. Units are globe units (the Earth's radius is 100),
// so it is hugely oversized on purpose: at true scale it would be invisible.
export function createShipModel(scale = 1): Group {
  const ship = new Group();

  const metal = new MeshLambertMaterial({ color: 0xd9dde3, emissive: 0x3a3f47 });
  const panel = new MeshLambertMaterial({ color: 0xe3b341, emissive: 0x5a4210 });
  const radiator = new MeshLambertMaterial({ color: 0xf4f6f8, emissive: 0x50555c });

  const truss = new Mesh(new BoxGeometry(7, 0.22, 0.22), metal);
  ship.add(truss);

  // Solar arrays: two pairs on each end of the truss, long in z, thin in y.
  for (const x of [-3.2, -2.4, 2.4, 3.2]) {
    for (const z of [-1.5, 1.5]) {
      const array = new Mesh(new BoxGeometry(0.6, 0.03, 2.6), panel);
      array.position.set(x, 0, z);
      ship.add(array);
    }
  }

  // Pressurized modules, lined up along the direction of flight.
  const modules = new Mesh(new CylinderGeometry(0.3, 0.3, 3, 12), metal);
  modules.rotation.x = Math.PI / 2;
  ship.add(modules);
  const node = new Mesh(new CylinderGeometry(0.34, 0.34, 1.1, 12), metal);
  node.rotation.z = Math.PI / 2;
  ship.add(node);

  // Radiators, below the truss.
  for (const x of [-1.1, 1.1]) {
    const plate = new Mesh(new BoxGeometry(0.9, 0.03, 0.6), radiator);
    plate.position.set(x, -0.3, 0);
    ship.add(plate);
  }

  ship.scale.setScalar(scale);
  return ship;
}
