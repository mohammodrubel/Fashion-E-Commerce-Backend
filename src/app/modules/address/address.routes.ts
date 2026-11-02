import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { Role } from '@prisma/client';
import AddressValidation from './address.validation';
import { AddressController } from './address.controller';

const router = express.Router();

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
