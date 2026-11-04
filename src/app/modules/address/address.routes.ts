import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { Role } from '@prisma/client';
import AddressValidation from './address.validation';
import { AddressController } from './address.controller';

const router = express.Router();

router
  .route('/me')
  .get(auth(), AddressController.GetMyAddresses)
  .post(
    auth(),
    validateRequest(AddressValidation.CreateMyAddressSchema),
    AddressController.CreateMyAddress,
  );

router
  .route('/me/:id')
  .patch(
    auth(),
    validateRequest(AddressValidation.UpdateAddressSchema),
    AddressController.UpdateMyAddress,
  )
  .delete(auth(), AddressController.DeleteMyAddress);

router
  .route('/')
  .get(auth(Role.ADMIN), AddressController.GetAllAddresses)
  .post(
    auth(Role.ADMIN),
    validateRequest(AddressValidation.CreateAddressSchema),
    AddressController.CreateAddress,
  );

router
  .route('/:id')
  .get(auth(Role.ADMIN), AddressController.GetSingleAddress)
  .patch(
    auth(Role.ADMIN),
    validateRequest(AddressValidation.UpdateAddressSchema),
    AddressController.UpdateAddress,
  )
  .delete(auth(Role.ADMIN), AddressController.DeleteAddress);

export const AddressRoutes = router;
